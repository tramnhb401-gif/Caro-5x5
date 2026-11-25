import { MatchHistoryItem } from '@caro/shared';
import { httpClient } from '../core/http/client';
import { mapMatchHistoryDtoToDomain } from '../mappers/history.mapper';
import { MatchHistoryDto } from '../types/history.dto';

const hasRemoteApi = () => Boolean(process.env.EXPO_PUBLIC_API_URL);

export const historyService = {
  createMatchRecord(
    item: Omit<MatchHistoryItem, 'id' | 'playedAt'>,
  ): MatchHistoryItem {
    const dto: MatchHistoryDto = {
      ...item,
      id: `match_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      playedAt: new Date().toISOString(),
    };
    return mapMatchHistoryDtoToDomain(dto);
  },

  async fetchHistory(): Promise<MatchHistoryItem[]> {
    if (!hasRemoteApi()) return [];
    const dtos = await httpClient.get<MatchHistoryDto[]>('/api/v1/history');
    return dtos.map(mapMatchHistoryDtoToDomain);
  },

  async saveMatch(
    item: Omit<MatchHistoryItem, 'id' | 'playedAt'>,
  ): Promise<MatchHistoryItem | null> {
    if (!hasRemoteApi()) return null;
    const dto = await httpClient.post<MatchHistoryDto>('/api/v1/history', item);
    return mapMatchHistoryDtoToDomain(dto);
  },

  async clearHistory(): Promise<void> {
    if (hasRemoteApi()) await httpClient.delete('/api/v1/history');
  },
};
