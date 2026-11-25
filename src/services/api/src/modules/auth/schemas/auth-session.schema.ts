import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true, collection: 'auth_sessions' })
export class AuthSession {
  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, expires: 0 })
  expiresAt: Date;
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
