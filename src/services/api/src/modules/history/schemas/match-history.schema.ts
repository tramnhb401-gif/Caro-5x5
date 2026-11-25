import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { AiDifficulty, GameMode, Player } from '@caro/shared';
import type { HydratedDocument } from 'mongoose';

export type MatchHistoryDocument = HydratedDocument<MatchHistory>;

@Schema({ collection: 'match_history' })
export class MatchHistory {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ['PVP_LOCAL', 'PVE'] })
  mode: GameMode;

  @Prop({ enum: ['easy', 'medium', 'hard'] })
  difficulty?: AiDifficulty;

  @Prop({ required: true, enum: ['X', 'O', 'DRAW'] })
  winner: Player | 'DRAW';

  @Prop({ required: true, min: 1, max: 25 })
  totalMoves: number;

  @Prop({ required: true, default: Date.now })
  playedAt: Date;
}

export const MatchHistorySchema = SchemaFactory.createForClass(MatchHistory);
MatchHistorySchema.index({ userId: 1, playedAt: -1 });
