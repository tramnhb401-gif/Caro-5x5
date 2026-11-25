// src/apps/mobile/src/mappers/leaderboard.mapper.ts
import { LeaderboardEntry } from '@caro/shared';
import { LeaderboardEntryDto } from '../types/leaderboard.dto';

export function mapLeaderboardDtoToDomain(
  dto: LeaderboardEntryDto,
  currentUserId?: string,
): LeaderboardEntry {
  return {
    id: dto.id,
    username: dto.username,
    elo: dto.elo,
    wins: dto.wins,
    losses: dto.losses,
    isCurrentUser: Boolean(currentUserId && dto.id === currentUserId),
  };
}
