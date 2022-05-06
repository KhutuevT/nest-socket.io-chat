import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createClient } from 'redis';
import { verify } from 'jsonwebtoken';
import { Socket, Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';

import { JWTGuard } from 'src/common/guards/auth.guard';
import { MessageService } from 'src/message/message.service';
import { UserIdInToken } from 'src/common/decorators/userId.decorator';
import { RoomService } from 'src/room/room.service';
import { Message } from 'src/message/schemas/message.schema';
import {
  AddUsersDto,
  ChangeAvatarRoomDto,
  ChangeNameRoomDto,
  CreateRoomDto,
  DeleteUserDto,
  MessageDto,
  RoomIdDto,
} from './dto/data.dto';

const redis = createClient();
redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect();

const ACCESS_KEY = process.env.JWT_ACCESS_KEY || '';

const getIdFromToken = (req) => {
  const authHeader = req.handshake.headers.authorization;
  if (!authHeader) throw new Error('Not Header Auth');

  const token = authHeader.split('Bearer ')[1];
  if (!token) throw new Error('Incorrect Token');

  try {
    return verify(token, ACCESS_KEY)._id;
  } catch (err) {
    throw new Error('Invalid Token');
  }
};

@UseGuards(JWTGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly messageService: MessageService,
    private readonly roomService: RoomService, // private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  private io: Server;
  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log(`Initialized!`);
  }

  async handleConnection(client: Socket) {
    try {
      const id = getIdFromToken(client);
      const rooms = await this.roomService.getRoomsUser(id);

      client.join(id);
      rooms.forEach((room) => client.join(room._id.toString()));

      await redis.set(id, client.id);
      const onlineUsers = await redis.keys('*');
      this.io.emit('online', onlineUsers);
      this.io.emit('onlineAdd');
      this.logger.log(`Client connected:${client.id}`);
    } catch (err) {
      this.logger.log(`error: ${err}`);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      this.logger.log(`Client disconnected:${client.id}`);
      const id = getIdFromToken(client);
      redis.del(id);
      const onlineUsers = await redis.keys('*');
      this.io.emit('online', onlineUsers);
    } catch (err) {
      this.logger.log(`error: ${err}`);
    }
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(
    @MessageBody() data: CreateRoomDto,
    @ConnectedSocket() client: Socket,
    @UserIdInToken() id: string,
  ) {
    const { name, users } = data;

    const room = await this.roomService.create(id, name, users);

    client.join(room._id.toString());

    room.membersId.forEach((members) =>
      this.io.to(members.toString()).emit('inviteRoom', room),
    );
  }

  @SubscribeMessage('deleteRoom')
  async onDeleteRoom(
    @MessageBody() data: RoomIdDto,
    @UserIdInToken() id: string,
  ) {
    const { roomId } = data;
    const room = await this.roomService.getRoomById(roomId);
    await this.roomService.delete(id, roomId);

    room.membersId.forEach((members) =>
      this.io
        .to(members.toString())
        .emit('infoDeleteRoom', { name: 'Room deleted', roomId: room._id }),
    );
  }

  @SubscribeMessage('changeNameRoom')
  async onChangeNameRoom(
    @MessageBody() data: ChangeNameRoomDto,
    @UserIdInToken() id: string,
  ) {
    const { roomId, name } = data;
    await this.roomService.changeName(id, roomId, name);
    await this.sendInfoRoom(roomId);
  }

  @SubscribeMessage('changeAvatarRoom')
  async onChangeAvatarRoom(
    @MessageBody() data: ChangeAvatarRoomDto,
    @UserIdInToken() id: string,
  ) {
    const { roomId, avatar } = data;
    await this.roomService.changeAvatar(id, roomId, avatar);
    await this.sendInfoRoom(roomId);
  }

  // TODO: this is not good function, because I think it is should happening in server
  @SubscribeMessage('banOrDelete')
  onBanOrDelete(
    @MessageBody() data: RoomIdDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    client.leave(roomId);
  }

  @SubscribeMessage('acceptInvite')
  async onAcceptInvite(
    @MessageBody() data: RoomIdDto,
    @ConnectedSocket() client: Socket,
    @UserIdInToken() id: string,
  ) {
    const { roomId } = data;

    const room = await this.roomService.getRoomById(roomId);

    client.join(roomId);

    const message = await this.messageService.add(
      id,
      roomId,
      'User was invited to this room',
      [{ role: 'system' }],
    );

    this.messageToClient(roomId, message);

    this.io.to(id).emit('infoRoom', room);
  }

  @SubscribeMessage('rejectInvite')
  async onRejectInvite(
    @MessageBody() data: RoomIdDto,
    @UserIdInToken() id: string,
  ) {
    const { roomId } = data;

    await this.roomService.leaveRoom(id, roomId);

    await this.sendInfoRoom(roomId);
  }

  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(
    @MessageBody() data: RoomIdDto,
    @UserIdInToken() id: string,
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    await this.roomService.leaveRoom(id, roomId);

    client.leave(roomId);

    const message = await this.messageService.add(
      id,
      roomId,
      'User left the room',
      [{ role: 'system' }],
    );

    this.messageToClient(roomId, message);

    await this.sendInfoRoom(roomId);
  }

  @SubscribeMessage('addInRoom')
  async onAddInRoom(
    @MessageBody() data: AddUsersDto,
    @UserIdInToken() id: string,
  ) {
    const { roomId, users } = data;

    const newUsers = await this.roomService.addUsers(id, roomId, users);

    const room = await this.roomService.getRoomById(roomId);

    if (newUsers === 'NoNewUsers') {
      this.io.to(id).emit('error', newUsers);
    } else {
      newUsers.forEach((members) =>
        this.io.to(members.toString()).emit('inviteRoom', room),
      );
    }

    this.io.to(id).emit('infoRoom', room);
  }

  @SubscribeMessage('removeFromRoom')
  async onRemoveFromRoom(
    @MessageBody() data: DeleteUserDto,
    @UserIdInToken() id: string,
  ) {
    const { roomId, userId } = data;

    const delUser = await this.roomService.deleteUser(id, roomId, userId);

    const room = await this.roomService.getRoomById(roomId);
    const message = await this.messageService.add(
      id,
      roomId,
      'User has been deleted',
      [{ role: 'system' }],
    );

    if (delUser === 'NoDelUsers') {
      this.io.to(id).emit('error', delUser);
    } else {
      this.io
        .to(delUser)
        .emit('infoDeleteRoom', { name: 'ban', roomId: room._id });
    }

    this.messageToClient(roomId, message);
    await this.sendInfoRoom(room._id);
  }

  @SubscribeMessage('openRoom')
  async onOpenRoom(
    @MessageBody() data: RoomIdDto,
    @UserIdInToken() id: string,
  ) {
    const { roomId } = data;

    const room = await this.roomService.getRoomById(roomId);
    if (!room.membersId.includes(id)) {
      this.io.to(id).emit('error', 'You are not a member of this room');
    } else {
      const messages = await this.messageService.getAllRoomMessage(roomId);
      this.io.to(id).emit('allRoomMessages', messages);
    }
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(
    @MessageBody() data: MessageDto,
    @UserIdInToken() id: string,
  ) {
    const { roomId, text, tags, voice } = data;

    const room = await this.roomService.getRoomById(roomId);

    if (!room.membersId.includes(id)) {
      this.io.to(id).emit('error', 'You are not a member of this room');
    } else {
      const message = await this.messageService.add(
        id,
        roomId,
        text,
        tags,
        voice,
      );

      this.messageToClient(roomId, message);
    }
  }

  private messageToClient(roomId: string, message: Message) {
    this.io.to(roomId).emit('messageToClient', message);
  }

  private async sendInfoRoom(roomId: string) {
    const room = await this.roomService.getRoomById(roomId);
    this.io.to(roomId).emit('infoRoom', room);
  }
}
