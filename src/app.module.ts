import { ChatModule } from './chat/chat.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleAuthModule } from './google-auth/google-auth.module';
import { RoomModule } from './room/room.module';
import { MessageModule } from './message/message.module';
import { config } from 'dotenv';

import { MongooseModule } from '@nestjs/mongoose';
import { TokenModule } from './token/token.module';
import { AuthModule } from './auth/auth.module';

config();
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
