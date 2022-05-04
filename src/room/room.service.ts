import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Room, RoomDocument } from './schema/room.schema';
import { Message, MessageDocument } from 'src/message/schemas/message.schema';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async create(ownerId: string, roomName: string, membersId: string[]) {
    try {
      if (!membersId.includes(ownerId)) membersId.push(ownerId);

      const newRoom = await this.roomModel.create({
        ownerId: ownerId,
        name: roomName,
        membersId: membersId,
      });

      const room = await newRoom.populate('ownerId');

      const { password, ...userInfo } = room.ownerId.toObject();

      room.ownerId = userInfo;

      return room;
    } catch (error: unknown) {
      throw new Error(`Create room error! Error: ${error}`);
    }
  }

  async delete(ownerId: string, roomId: string) {
    try {
      return await this.roomModel
        .deleteOne({ owner: ownerId, _id: roomId })
        .then(async (res) => {
          const messages = await this.messageModel.deleteMany({ room: roomId });
          return {
            roomCount: res.deletedCount,
            messageCount: messages.deletedCount,
          };
        });
    } catch (error: unknown) {
      throw new Error(`Delete room error! Error: ${error}`);
    }
  }

  async addUsers(ownerId: string, roomId: string, userId: string[]) {
    try {
      const room = await this.roomModel.findOne({
        _id: roomId,
        owner: ownerId,
      });

      if (!room) throw new Error('No room');

      let check = false;
      const newUsers = [];

      userId.map((id) => {
        if (!room.membersId.includes(id)) {
          room.membersId.push(id);
          newUsers.push(id);
          check = true;
        }
      });

      await room.save();

      if (check) return newUsers;

      return 'NoNewUsers';
    } catch (error: unknown) {
      throw new Error(`Add users in room error! Error: ${error}`);
    }
  }

  async deleteUser(ownerId: string, roomId: string, userId: string) {
    try {
      const room = await this.roomModel.findOne({
        _id: roomId,
        owner: ownerId,
      });

      if (!room) throw new Error('No room');

      return await this.commonDelete(room, userId);
    } catch (error: unknown) {
      throw new Error(`Delete users in room error! Error: ${error}`);
    }
  }

  async leaveRoom(userId: string, roomId: string) {
    try {
      const room = await this.roomModel.findOne({
        _id: roomId,
      });

      if (!room) throw new Error('No room');

      if (room.ownerId.toString() === userId) return 'You are owner';
      return await this.commonDelete(room, userId);
    } catch (error: unknown) {
      throw new Error(`Leave users in room error! Error: ${error}`);
    }
  }

  async changeName(ownerId: string, roomId: string, roomName: string) {
    try {
      const room = await this.roomModel.findOne({
        _id: roomId,
        owner: ownerId,
      });

      if (!room) throw new Error('No room');

      if (!roomName) throw new Error('No name');

      room.name = roomName;

      await room.save();

      return room;
    } catch (error: unknown) {
      throw new Error(`Change name room error! Error: ${error}`);
    }
  }

  async getRoomsUser(userId: string) {
    try {
      return await this.roomModel.find().then((result) => {
        return result.filter((room) => room.membersId.includes(userId));
      });
    } catch (error: unknown) {
      throw new Error(`Find room error! Error: ${error}`);
    }
  }

  async getRoomById(roomId: string) {
    try {
      const roomById = await this.roomModel.findOne({ _id: roomId });

      const room = await roomById.populate('ownerId');

      const { password, ...userInfo } = room.ownerId.toObject();

      room.ownerId = userInfo;

      return room;

      return;
    } catch (error: unknown) {
      throw new Error(`Find room error! Error: ${error}`);
    }
  }

  async changeAvatar(ownerId: string, roomId: string, avatar: string) {
    try {
      const room = await this.roomModel.findOne({
        _id: roomId,
        owner: ownerId,
      });

      if (!room) throw new Error('No room');

      if (!avatar) throw new Error('No avatar');

      room.avatar = avatar;

      await room.save();

      return room;
    } catch (error: unknown) {
      throw new Error(`Change avatar room error! Error: ${error}`);
    }
  }

  private async commonDelete(room: RoomDocument, userId: string) {
    let check = false;

    if (room.membersId.includes(userId)) {
      room.membersId = room.membersId.filter((id) => id.toString() !== userId);
      check = true;
    }

    await room.save();

    if (check) return userId;

    return 'NoDelUsers';
  }
}
