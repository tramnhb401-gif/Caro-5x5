import { describe, it, expect, beforeEach } from 'vitest';
import { TOTAL_CELLS } from '@caro/shared';
import { useGameStore, INITIAL_GAME_RESULT } from './game.store';

describe('useGameStore (pure client state)', () => {
  beforeEach(() => {
    useGameStore.getState().initGame('PVP_LOCAL');
  });

  it('1. Khởi tạo bàn cờ 25 ô rỗng và lượt X đầu tiên', () => {
    const state = useGameStore.getState();
    expect(state.board).toHaveLength(TOTAL_CELLS);
    expect(state.board.every((cell) => cell === null)).toBe(true);
    expect(state.currentTurn).toBe('X');
    expect(state.result).toEqual(INITIAL_GAME_RESULT);
  });

  it('2. Cập nhật board, currentTurn, isAiThinking và result chính xác', () => {
    const nextBoard = [...useGameStore.getState().board];
    nextBoard[12] = 'X';
    useGameStore.getState().setBoard(nextBoard);
    useGameStore.getState().setCurrentTurn('O');
    useGameStore.getState().setAiThinking(true);

    const state = useGameStore.getState();
    expect(state.board[12]).toBe('X');
    expect(state.currentTurn).toBe('O');
    expect(state.isAiThinking).toBe(true);
  });

  it('3. resetBoard giữ nguyên mode và difficulty hiện tại nhưng làm sạch bàn cờ', () => {
    useGameStore.getState().initGame('PVE', 'hard');
    const nextBoard = [...useGameStore.getState().board];
    nextBoard[0] = 'X';
    useGameStore.getState().setBoard(nextBoard);
    useGameStore.getState().setResult({
      status: 'WIN',
      winner: 'X',
      winningLine: [0, 1, 2, 3],
    });

    useGameStore.getState().resetBoard();

    const state = useGameStore.getState();
    expect(state.mode).toBe('PVE');
    expect(state.difficulty).toBe('hard');
    expect(state.board.every((cell) => cell === null)).toBe(true);
    expect(state.result.status).toBe('PLAYING');
  });
});
