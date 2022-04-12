import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { MessageService } from 'src/message/message.service';
import { RoomService } from 'src/room/room.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({ port: 1080, namespace: 'messages' }) // OnModuleInit
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly roomService: RoomService,
    private readonly userService: UserService,
  ) {}

  async handleConnection(socket: Socket) {
    // pass
  }

  async handleDisconnect(socket: Socket) {
    // pass
  }

  @SubscribeMessage('test')
  onTest(@MessageBody('test') test: string) {
    console.log(test);
    return test;
  }

  @SubscribeMessage('createRoom')
  onCreateRoom(@MessageBody('roomId') roomId: number) {
    // pass
  }

  @SubscribeMessage('joinRoom')
  onJoinRoom(@MessageBody('roomId') roomId: number) {
    // pass
  }

  @SubscribeMessage('leaveRoom')
  onLeaveRoom(@MessageBody('roomId') roomId: number) {
    // pass
  }

  @SubscribeMessage('addMessage')
  onAddMessage(@MessageBody('message') data: string) {
    // pass
  }
}
