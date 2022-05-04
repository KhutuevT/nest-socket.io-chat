import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { createClient } from 'redis';
import { Socket, Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';

import { JWTGuard } from 'src/common/guards/auth.guard';
import { MessageService } from 'src/message/message.service';
import { Token } from 'src/common/decorators/token.decorator';
const onlineUsers = {};
const redis = createClient();
redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect();
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

  async handleConnection(client: Socket) {
    const { roomId, userId } = client.handshake.query;

    client.join(roomId);
    this.logger.log(`Client connected:${client.id}`);

    await redis.set(userId.toString(),client.id);
    const onlineUsers = await redis.keys('*');
    this.io.emit('online', onlineUsers);
  }

  async handleDisconnect(client: Socket) {
    const { userId } = client.handshake.query;
    this.logger.log(`Client disconnected:${client.id}`);

    redis.del(userId.toString());
    const onlineUsers = await redis.keys('*');
    this.io.emit('online', onlineUsers);
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
