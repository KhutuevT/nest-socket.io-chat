import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './user.schema';
import { MessageSchema } from 'src/message/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: MessageSchema }]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
