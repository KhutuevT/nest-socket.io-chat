import { Module } from '@nestjs/common';

import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessageModule } from 'src/message/message.module';

@Module({
  imports: [MessageModule],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
