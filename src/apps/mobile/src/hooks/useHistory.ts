import { useEffect } from 'react';
import { MatchHistoryItem } from '@caro/shared';
import { historyService } from '../services/history.service';
import { useHistoryStore } from '../store/history.store';

export function useHistory() {
  const matches = useHistoryStore((state) => state.matches);
  const prependMatch = useHistoryStore((state) => state.prependMatch);
  const replaceMatch = useHistoryStore((state) => state.replaceMatch);
  const setMatches = useHistoryStore((state) => state.setMatches);
  const clearMatches = useHistoryStore((state) => state.clearMatches);

  useEffect(() => {
    void historyService
      .fetchHistory()
      .then(setMatches)
      .catch(() => undefined);
  }, [setMatches]);

  const addMatch = (item: Omit<MatchHistoryItem, 'id' | 'playedAt'>) => {
    const record = historyService.createMatchRecord(item);
    prependMatch(record);
    void historyService
      .saveMatch(item)
      .then((savedRecord) => {
        if (savedRecord) replaceMatch(record.id, savedRecord);
      })
      .catch(() => undefined);
  };

  const clearHistory = async () => {
    await historyService.clearHistory();
    clearMatches();
  };

  return {
    matches,
    addMatch,
    clearHistory,
  };
}
