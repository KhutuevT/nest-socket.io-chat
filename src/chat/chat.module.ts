import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatGateway],
  providers: [ChatService],
})
export class ChatModule {}
