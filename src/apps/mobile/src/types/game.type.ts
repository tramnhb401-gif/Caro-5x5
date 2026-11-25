import { AiDifficulty, CellValue, Player } from '@caro/shared';

export interface AiMoveRequest {
  board: CellValue[];
  aiPlayer: Player;
  difficulty: AiDifficulty;
}
