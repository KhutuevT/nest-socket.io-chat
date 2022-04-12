import { Logger, OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ClientRequest } from 'http';
import { Socket, Server } from 'socket.io';
import { MessageService } from 'src/message/message.service';
import { RoomService } from 'src/room/room.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway(1030, {
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  // constructor(
  //   private readonly messageService: MessageService,
  //   private readonly roomService: RoomService,
  //   private readonly userService: UserService,
  // ) {}
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log(`Initialized!`);
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected:${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected:${client.id}`);
  }

  @SubscribeMessage('createRoom')
  onCreateRoom(@MessageBody() roomId: number) {
    // return `createRoom: ${roomId}`;
  }

  @SubscribeMessage('joinRoom')
  onJoinRoom(@MessageBody() roomId: number) {
    // return `joinRoom: ${roomId}`;
  }

  @SubscribeMessage('leaveRoom')
  onLeaveRoom(@MessageBody() roomId: number) {
    // return `leaveRoom: ${roomId}`;
  }

  @SubscribeMessage('addMessage')
  onAddMessage(@MessageBody() data: string) {
    this.server.emit('messageToClient', data);
    // return `addMessage: ${data}`;
  }
}
