import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { ChatModule } from './chat/chat.module';
import { RoomModule } from './room/room.module';
import { MessageModule } from './message/message.module';
import { config } from 'dotenv';

import { MongooseModule } from '@nestjs/mongoose';

config();
@Module({
  imports: [
    GoogleAuthModule,
    ChatModule,
    RoomModule,
    MessageModule,
    MongooseModule.forRoot(process.env.MONGODB_URL),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
