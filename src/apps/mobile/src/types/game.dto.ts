import { AiDifficulty, CellValue, Player } from '@caro/shared';

export interface AiMoveRequestDto {
  board: CellValue[];
  ai_player: Player;
  difficulty: AiDifficulty;
}

export interface AiMoveResponseDto {
  move_index: number | null;
}
