import { ChatModule } from './chat/chat.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';

config();

import { RoomModule } from './room/room.module';
import { AppService } from './app.service';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { AppController } from './app.controller';
import { MessageModule } from './message/message.module';
import { TokenModule } from './token/token.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    GoogleAuthModule,
    ChatModule,
    RoomModule,
    MessageModule,
    MongooseModule.forRoot(process.env.MONGODB_URL),
    TokenModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
