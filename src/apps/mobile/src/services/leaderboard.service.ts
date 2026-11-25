import { LeaderboardEntry, UserProfile } from '@caro/shared';
import { httpClient } from '../core/http/client';
import { mapLeaderboardDtoToDomain } from '../mappers/leaderboard.mapper';
import { LeaderboardEntryDto } from '../types/leaderboard.dto';

const hasRemoteApi = () => Boolean(process.env.EXPO_PUBLIC_API_URL);

const SEED_PLAYER_DTOS: LeaderboardEntryDto[] = [];

export const leaderboardService = {
  async fetchLeaderboard(
    currentUser: UserProfile | null,
  ): Promise<LeaderboardEntry[]> {
    if (hasRemoteApi()) {
      const dtos = await httpClient.get<LeaderboardEntryDto[]>(
        '/api/v1/leaderboard',
      );
      return dtos
        .map((dto) => mapLeaderboardDtoToDomain(dto, currentUser?.id))
        .sort((a, b) => b.elo - a.elo);
    }

    const dtos: LeaderboardEntryDto[] = [...SEED_PLAYER_DTOS];
    if (currentUser) {
      dtos.push({
        id: currentUser.id,
        username: `${currentUser.username} (Bạn)`,
        elo: currentUser.elo,
        wins: currentUser.wins,
        losses: currentUser.losses,
      });
    }

    return dtos
      .map((dto) => mapLeaderboardDtoToDomain(dto, currentUser?.id))
      .sort((a, b) => b.elo - a.elo);
  },
};
