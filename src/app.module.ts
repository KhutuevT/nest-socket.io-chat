import { config } from 'dotenv';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

config();

import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { RoomModule } from './room/room.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { TokenModule } from './token/token.module';
import { MessageModule } from './message/message.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ChatModule,
    RoomModule,
    MessageModule,
    MongooseModule.forRoot(process.env.MONGODB_URL),
    TokenModule,
    AuthModule,
    UploadModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
