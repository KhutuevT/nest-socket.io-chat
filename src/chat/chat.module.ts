import { Module } from '@nestjs/common';

import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessageModule } from 'src/message/message.module';
import { RoomModule } from 'src/room/room.module';

@Module({
  imports: [MessageModule, RoomModule],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
