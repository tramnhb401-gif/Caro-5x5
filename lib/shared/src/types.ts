export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type GameStatus = 'PLAYING' | 'WIN' | 'DRAW';
export type GameMode = 'PVP_LOCAL' | 'PVE';
export type AiDifficulty = 'easy' | 'medium' | 'hard';

export interface GameResult {
  status: GameStatus;
  winner: Player | null;
  winningLine: number[];
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface MatchHistoryItem {
  id: string;
  mode: GameMode;
  difficulty?: AiDifficulty;
  winner: Player | 'DRAW';
  totalMoves: number;
  playedAt: string; // ISO string
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  isCurrentUser?: boolean;
}
