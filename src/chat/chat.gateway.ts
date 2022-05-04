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
import { Socket, Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';

import { JWTGuard } from 'src/common/guards/auth.guard';
import { MessageService } from 'src/message/message.service';
import { UserIdInToken } from 'src/common/decorators/userId.decorator';
import { RoomService } from 'src/room/room.service';
import { Message } from 'src/message/schemas/message.schema';
import { Room } from 'src/room/schema/room.schema';

const users = {};

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
    const { userId } = client.handshake.query as { [key: string]: string };

    const rooms = await this.roomService.getRoomsUser(userId);

    client.join(userId);
    rooms.forEach((room) => client.join(room._id.toString()));

    this.io.to(userId).emit('getAllRooms', rooms);

    this.logger.log(`Client connected:${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected:${client.id}`);
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
    @UserIdInToken() id: string,
  ) {
    const room = await this.roomService.create(id, data.name, data.users);

    client.join(room._id.toString());

    room.membersId.forEach((members) =>
      this.io.to(members.toString()).emit('inviteRoom', room),
    );
  }

  @SubscribeMessage('acceptInvite')
  async onAcceptInvite(
    @MessageBody() data: any,
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
  async onRejectInvite(@MessageBody() data: any, @UserIdInToken() id: string) {
    const { roomId } = data;

    await this.roomService.leaveRoom(id, roomId);

    await this.sendInfoRoom(roomId);
  }

  @SubscribeMessage('leaveRoom')
  async onLeaveRoom(
    @MessageBody() data: any,
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
  async onAddInRoom(@MessageBody() data: any, @UserIdInToken() id: string) {
    const newUsers = await this.roomService.addUsers(
      id,
      data.roomId,
      data.users,
    );

    const room = await this.roomService.getRoomById(data.roomId);

    if (newUsers === 'NoNewUsers') {
      this.io.to(id).emit('error', newUsers);
    } else {
      newUsers.forEach((members) =>
        this.io.to(members.toString()).emit('inviteRoom', room),
      );
    }

    this.io.to(id).emit('infoRoom', room);
  }

  @SubscribeMessage('onRemoveFromRoom')
  async onRemoveFromRoom(
    @MessageBody() data: any,
    @UserIdInToken() id: string,
  ) {
    const delUser = await this.roomService.deleteUser(
      id,
      data.roomId,
      data.user,
    );

    const room = await this.roomService.getRoomById(data.roomId);
    const message = await this.messageService.add(
      id,
      data.roomId,
      'User has been deleted',
      [{ role: 'system' }],
    );

    if (delUser === 'NoDelUsers') {
      this.io.to(id).emit('error', delUser);
    } else {
      this.io.to(delUser).emit('infoDeleteRoom', room._id);
    }

    this.messageToClient(data.roomId, message);
    await this.sendInfoRoom(room._id);
  }

  @SubscribeMessage('openRoom')
  async onOpenRoom(@MessageBody() data: any, @UserIdInToken() id: string) {
    const messages = await this.messageService.getAllRoomMessage(data.roomId);
    this.io.to(id).emit('allRoomMessages', messages);
  }

  @SubscribeMessage('addMessage')
  async onAddMessage(@MessageBody() data: any, @UserIdInToken() id: string) {
    const message = await this.messageService.add(
      id,
      data.roomId,
      data.text,
      data.tags,
      data.voice,
    );

    this.messageToClient(data.roomId, message);
  }

  private messageToClient(roomId: string, message: Message) {
    this.io.to(roomId).emit('messageToClient', message);
  }

  private async sendInfoRoom(roomId: string) {
    const room = await this.roomService.getRoomById(roomId);
    this.io.to(roomId).emit('infoRoom', room);
  }
}
