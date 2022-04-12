import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, default: 'Anonymous' })
  email: string;

  @Prop()
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, default: 'default.png' })
  avatar: string;

  @Prop({ default: Date.now, required: true })
  createData: Date;

  @Prop({ default: 'Active' })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
