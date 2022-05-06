import { Model } from 'mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Message, MessageDocument, Tag } from './schemas/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async add(userId: string, roomId: string, text: string, tags?: Tag[], voice?: string) {
      if (!(text || voice)) throw new BadRequestException(`message object must contain text or voice!`);
      if (text && voice) throw new BadRequestException(`message can't contain both text and voice!`); 
      try {
      const message = await this.messageModel.create({
        user: userId,
        room: roomId,
        text,
        tags,
        voice
      });

      const newMessage = await this.messageModel
        .find({
          _id: message._id,
        })
        .populate('user');
      const arr = newMessage.map((message) => {
        const { password, ...userInfo } = message.user.toObject();
        return {
          ...message.toObject(),
          user: userInfo,
        };
      });

      return arr[0];
    } catch (error: unknown) {
      throw new Error(`Add error! Error: ${error}`);
    }
  }

  async delete(messageId: string, userId: string) {
    try {
      return await this.messageModel.deleteOne({
        _id: messageId,
        user: userId,
      });
    } catch (error: unknown) {
      throw new Error(`Delete error! Error: ${error}`);
    }
  }

  async change(messageId: string, userId: string, text: string) {
    try {
      return await this.messageModel.updateOne(
        { _id: messageId, user: userId },
        { text },
      );
    } catch (error: unknown) {
      throw new Error(`Change error! Error: ${error}`);
    }
  }

  async getAllRoomMessage(roomId: string) {
    try {
      const messages = await this.messageModel
        .find({ room: roomId })
        .populate('user');
      const arr = messages.map((message) => {
        const { password, ...userInfo } = message.user.toObject();
        return {
          ...message.toObject(),
          user: userInfo,
        };
      });

      return arr;
    } catch (error: unknown) {
      throw new Error(`DB error! Error: ${error}`);
    }
  }
}
