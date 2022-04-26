import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Room } from 'src/room/room.schema';
// import { User } from 'src/user/user.schema';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  // TODO fix any
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: any;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true })
  room: Room;

  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  isChanged: boolean;

  @Prop({ default: Date.now, required: true })
  createData: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
