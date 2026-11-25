import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '../services/leaderboard.service';
import { useAuth } from './useAuth';

export function useLeaderboard() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['leaderboard', user?.id, user?.elo],
    queryFn: () => leaderboardService.fetchLeaderboard(user),
  });

  return {
    rankedPlayers: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
