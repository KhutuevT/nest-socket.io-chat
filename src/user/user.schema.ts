import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, default: 'Anonymous', unique: true })
  email: string;

  @Prop({ required: false })
  password: string;

  @Prop({ required: true, default: 'Anonymous' })
  firstName: string;

  @Prop({ required: true, default: 'Anonymous' })
  lastName: string;

  @Prop({ required: true, default: 'defaultAvatar.png' })
  avatar: string;

  @Prop({ default: Date.now, required: true })
  createData: Date;

  @Prop({ default: 'Active' })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
