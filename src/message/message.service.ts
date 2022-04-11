import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async add(messageId: string, userId: string, roomId: string, text: string) {
    const newMessage = new this.messageModel({
      user: userId,
      room: roomId,
      text,
    });

    return newMessage.save();
  }

  async delete(messageId: string, userId: string) {
    return await this.messageModel.deleteOne({ _id: messageId, user: userId });
  }

  async change(messageId: string, userId: string, text: string) {
    return await this.messageModel.updateOne(
      { _id: messageId, user: userId },
      { text },
    );
  }

  async getAllRoomMessage(roomId: string) {
    return await this.messageModel.find({ room: roomId });
  }
}
