import {
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
import { Token } from 'src/common/decorators/token.decorator';

const onlineUsers = {};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly messageService: MessageService, // private readonly roomService: RoomService, // private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  private io: Server;
  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log(`Initialized!`);
  }

  @UseGuards(JWTGuard)
  async handleConnection(client: Socket, @Token() id: string) {
    const { roomId, userId } = client.handshake.query;

    client.join(roomId);

    this.logger.log(`Client connected:${client.id}`);
    onlineUsers[client.id] = id;
    console.log(`data: ${Object.keys(client.data)}`);
    //console.log(`Online: ${Object.values(onlineUsers)}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected:${client.id}`);
    delete onlineUsers[client.id];
    console.log(`Online: ${Object.values(onlineUsers)}`);
  }

  @SubscribeMessage('test')
  onTest(@MessageBody() test: string) {
    return test;
  }

  @SubscribeMessage('createRoom')
  onCreateRoom(@MessageBody() roomId: number) {
    // return `createRoom: ${roomId}`;
  }

  @SubscribeMessage('joinRoom')
  async onJoinRoom(@MessageBody() data: any) {
    const messages = await this.messageService.getAllRoomMessage(data.roomId);
    this.io.to(data.roomId).emit('allRoomMessages', messages);
  }

  @SubscribeMessage('leaveRoom')
  onLeaveRoom(@MessageBody() roomId: number) {
    // return `leaveRoom: ${roomId}`;
  }

  @UseGuards(JWTGuard)
  @SubscribeMessage('addMessage')
  async onAddMessage(@MessageBody() data: any, @Token() id: string) {
    console.log(`id: ${id}`);
    const message = await this.messageService.add(
      id,
      data.roomId,
      data.text,
      data.tags,
      data.voice
    );
    this.io.to(data.roomId).emit('messageToClient', message);
  }
}
