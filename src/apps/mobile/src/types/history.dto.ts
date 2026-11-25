import { AiDifficulty, GameMode } from '@caro/shared';

export interface MatchHistoryDto {
  id: string;
  mode: GameMode;
  difficulty?: AiDifficulty;
  winner: 'X' | 'O' | 'DRAW';
  totalMoves: number;
  playedAt: string;
}
