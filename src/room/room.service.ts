import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Room, RoomDocument, RoomSchema } from './room.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class RoomService {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  async create(ownerId: string, roomName: string, membersId: string[]) {
    const newRoom = new this.roomModel({
      ownerId: ownerId,
      name: roomName,
      membersId: membersId 
    });

    return newRoom.save();
  }

  async delete(ownerId: string, roomID: string) {
    return await this.roomModel.deleteOne({ owner: ownerId, _id: roomID });
  }

  async addUser(ownerId: string, roomId: string, userId: string) {
    return await this.roomModel.updateOne(
      { _id: roomId, owner: ownerId },
      { $push: { users: userId } },
    );
  }

  async deleteUser(ownerId: string, userId: string, roomId: string) {
    if (ownerId) {
      return await this.roomModel.updateOne(
        { _id: roomId, owner: ownerId },
        { $pull: { users: userId } },
      );
    }
    return await this.roomModel.updateOne(
      { _id: roomId },
      { $pull: { users: userId } },
    );
  }

  async changeName(ownerId: string, roomId: string, roomName: string) {
    return await this.roomModel.updateOne(
      { _id: roomId, owner: ownerId },
      { name: roomName },
    );
  }

  async changeAvatar(ownerId: string, roomId: string, avatar: string) {
    return await this.roomModel.updateOne(
      { _id: roomId, owner: ownerId },
      { avatar },
    );
  }

  async getAllRoom(roomId: string) {
    return await this.roomModel.find({ _id: roomId });
  }
}
