import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/auth.service';
import { historyService } from '../services/history.service';
import { useAuthStore } from './auth.store';
import { useHistoryStore } from './history.store';

describe('Auth & History Services + Stores', () => {
  beforeEach(() => {
    useAuthStore.getState().clearUser();
    useHistoryStore.getState().clearMatches();
  });

  it('1. authService.login từ chối email sai hoặc mật khẩu ngắn', async () => {
    await expect(authService.login('sai-email', '1234')).rejects.toThrow();
    await expect(authService.login('test@mail.com', '123')).rejects.toThrow();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('2. authService.register tạo hồ sơ với Elo 1000 và clearUser xóa phiên', async () => {
    const profile = await authService.register('Min', 'min@mail.com', '123456');
    useAuthStore.getState().setUser(profile);

    expect(useAuthStore.getState().user?.username).toBe('Min');
    expect(useAuthStore.getState().user?.elo).toBe(1000);

    await authService.logout();
    useAuthStore.getState().clearUser();
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('3. applyMatchOutcome cập nhật Elo đúng cho WIN (+25), LOSS (-15), DRAW (+5)', async () => {
    const profile = await authService.login('min@mail.com', '1234');
    useAuthStore.getState().setUser(profile);

    useAuthStore.getState().applyMatchOutcome('WIN');
    expect(useAuthStore.getState().user?.elo).toBe(1025);
    expect(useAuthStore.getState().user?.wins).toBe(1);

    useAuthStore.getState().applyMatchOutcome('LOSS');
    expect(useAuthStore.getState().user?.elo).toBe(1010);
    expect(useAuthStore.getState().user?.losses).toBe(1);

    useAuthStore.getState().applyMatchOutcome('DRAW');
    expect(useAuthStore.getState().user?.elo).toBe(1015);
    expect(useAuthStore.getState().user?.draws).toBe(1);
  });

  it('4. historyService + useHistoryStore lưu trận mới lên đầu và xóa sạch khi clearMatches', () => {
    const m1 = historyService.createMatchRecord({
      mode: 'PVP_LOCAL',
      winner: 'X',
      totalMoves: 7,
    });
    const m2 = historyService.createMatchRecord({
      mode: 'PVE',
      difficulty: 'hard',
      winner: 'O',
      totalMoves: 9,
    });

    useHistoryStore.getState().prependMatch(m1);
    useHistoryStore.getState().prependMatch(m2);

    const matches = useHistoryStore.getState().matches;
    expect(matches).toHaveLength(2);
    expect(matches[0].mode).toBe('PVE');
    expect(matches[1].mode).toBe('PVP_LOCAL');

    useHistoryStore.getState().clearMatches();
    expect(useHistoryStore.getState().matches).toHaveLength(0);
  });
});
