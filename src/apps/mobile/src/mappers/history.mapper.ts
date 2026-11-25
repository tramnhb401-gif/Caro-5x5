import { MatchHistoryItem } from '@caro/shared';
import { MatchHistoryDto } from '../types/history.dto';

export function mapMatchHistoryDtoToDomain(
  dto: MatchHistoryDto,
): MatchHistoryItem {
  return {
    id: dto.id,
    mode: dto.mode,
    difficulty: dto.difficulty,
    winner: dto.winner,
    totalMoves: dto.totalMoves,
    playedAt: dto.playedAt,
  };
}
