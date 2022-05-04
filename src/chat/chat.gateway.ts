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

    this.io.to(id).emit('infoRoom', room);
  }

  @SubscribeMessage('rejectInvite')
  async onRejectInvite(@MessageBody() data: any, @UserIdInToken() id: string) {
    const { roomId } = data;

    await this.roomService.leaveRoom(id, roomId);
    const room = await this.roomService.getRoomById(roomId);

    this.io.to(roomId).emit('infoRoom', room);
  }

  @SubscribeMessage('openRoom')
  async onOpenRoom(@MessageBody() data: any, @UserIdInToken() id: string) {
    const messages = await this.messageService.getAllRoomMessage(data.roomId);
    this.io.to(id).emit('allRoomMessages', messages);
  }

  @SubscribeMessage('leaveRoom')
  onLeaveRoom(@MessageBody() roomId: number) {
    // return `leaveRoom: ${roomId}`;
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
    this.io.to(data.roomId).emit('messageToClient', message);
  }
}
