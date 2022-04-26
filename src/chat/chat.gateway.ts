import { Logger, OnModuleInit, Req, UseGuards } from '@nestjs/common';
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
import { Token } from 'src/common/decorators/token.decorator';
import { JWTGuard } from 'src/common/guards/auth.guard';
import { MessageService } from 'src/message/message.service';
// import { RoomService } from 'src/room/room.service';
// import { UserService } from 'src/user/user.service';

const users = {};

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

    console.log(roomId, userId);

    client.join(roomId);

    this.logger.log(`Client connected:${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected:${client.id}`);
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
    const message = await this.messageService.add(id, data.roomId, data.text);
    this.io.to(data.roomId).emit('messageToClient', message);
  }
}
