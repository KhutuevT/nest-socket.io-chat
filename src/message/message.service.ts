import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Response } from 'express';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async add(userId: string, roomId: string, text: string, res: Response) {
    try {
      const newMessage = await this.messageModel.create({
        user: userId,
        room: roomId,
        text,
      });

      // return await this.messageModel.create({
      //   user: userId,
      //   room: roomId,
      //   text,
      // });
      return res.send(newMessage);
    } catch (error: unknown) {
      throw new Error(`Add error! Error: ${error}`);
    }
  }

  async delete(messageId: string, userId: string, res: Response) {
    try {
      // return await this.messageModel.deleteOne({
      //   _id: messageId,
      //   user: userId,
      // });
      const message = await this.messageModel.deleteOne({
        _id: messageId,
        user: userId,
      });
      return res.send(message);
    } catch (error: unknown) {
      throw new Error(`Delete error! Error: ${error}`);
    }
  }

  async change(messageId: string, userId: string, text: string, res: Response) {
    try {
      // return await this.messageModel.updateOne(
      //   { _id: messageId, user: userId },
      //   { text },
      // );
      const message = await this.messageModel.updateOne(
        { _id: messageId, user: userId },
        { text, isChanged: true },
      );
      return res.send(message);
    } catch (error: unknown) {
      throw new Error(`Change error! Error: ${error}`);
    }
  }

  async getAllRoomMessage(roomId: string, res: Response) {
    try {
      // return await this.messageModel.find({ room: roomId }).populate('userId');
      const messages = await this.messageModel
        .find({ room: roomId })
        .populate('user');
      const arr = messages.map((message) => {
        const { _id, email, firstName, lastName, avatar, status, createData } =
          message.user;
        message.user = {
          _id,
          email,
          firstName,
          lastName,
          avatar,
          status,
          createData,
        };
        return message;
      });
      return res.send(arr);
    } catch (error: unknown) {
      throw new Error(`DB error! Error: ${error}`);
    }
  }
}
