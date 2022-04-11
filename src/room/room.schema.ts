import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { User } from 'src/user/user.schema';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
  @Prop({ required: true, default: 'defaultRoomName' })
  name: string;

  @Prop({ required: true, default: 'defaultRoom.png' })
  avatar: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  users: User[];

  @Prop({ default: Date.now, required: true })
  createData: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
