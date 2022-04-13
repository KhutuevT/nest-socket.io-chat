import { Module } from '@nestjs/common';
import { MessageModule } from 'src/message/message.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  imports: [MessageModule],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
