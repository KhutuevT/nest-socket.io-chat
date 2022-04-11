import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { ChatModule } from './chat/chat.module';
import { RoomModule } from './room/room.module';
import { MessageModule } from './message/message.module';
@Module({
  imports: [GoogleAuthModule, ChatModule, RoomModule, MessageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
