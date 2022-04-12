import { RoomService } from 'src/room/room.service';
import { UserService } from 'src/user/user.service';
import { RoomModule } from './../room/room.module';
import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { MessageModule } from 'src/message/message.module';
import { MessageService } from 'src/message/message.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController, ChatGateway],
  imports: [MessageModule, UserModule, RoomModule],
  providers: [ChatService, MessageService, UserService, RoomService],
})
export class ChatModule {}
