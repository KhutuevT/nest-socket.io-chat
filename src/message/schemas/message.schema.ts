import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Room } from 'src/room/schema/room.schema';

export type MessageDocument = Message & Document;

export type Tag = {
  nameUser: string;
  email: string;
};
@Schema()
export class Message {
  // TODO fix any
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: any;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true })
  room: Room;

  @Prop({ required: false })
  text: string;

  @Prop({ required: false })
  voice: string;

  @Prop({ required: false })
  tags?: Tag[];

  @Prop({ default: false })
  isChanged: boolean;

  @Prop({ default: Date.now, required: true })
  createData: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
