import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 20 })
  username: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  passwordSalt: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, default: 1000 })
  elo: number;

  @Prop({ required: true, default: 0 })
  wins: number;

  @Prop({ required: true, default: 0 })
  losses: number;

  @Prop({ required: true, default: 0 })
  draws: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
