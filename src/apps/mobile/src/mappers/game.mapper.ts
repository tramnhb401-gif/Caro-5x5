import { AiMoveRequest } from '../types/game.type';
import { AiMoveRequestDto, AiMoveResponseDto } from '../types/game.dto';

export function mapAiMoveRequestToDto(req: AiMoveRequest): AiMoveRequestDto {
  return {
    board: req.board,
    ai_player: req.aiPlayer,
    difficulty: req.difficulty,
  };
}

export function mapAiMoveResponseDtoToIndex(
  dto: AiMoveResponseDto,
): number | null {
  return dto.move_index;
}
