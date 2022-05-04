import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
  @Prop({ required: true, default: 'defaultRoomName' })
  name: string;

  @Prop({ required: true, default: 'defaultRoom.png' })
  avatar: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  ownerId: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', sparse: true }],
  })
  membersId: string[];

  @Prop({ default: Date.now, required: true })
  createData: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
