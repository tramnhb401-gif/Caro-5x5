import { describe, it, expect } from 'vitest';
import { checkGameResult } from './game-rules';
import { CellValue } from './types';
import { TOTAL_CELLS } from './constants';

const emptyBoard = (): CellValue[] => Array(TOTAL_CELLS).fill(null);

describe('Luật Caro 5x5 (4 quân liên tiếp)', () => {
  it('1. Bàn cờ trống phải trả về PLAYING', () => {
    const res = checkGameResult(emptyBoard());
    expect(res).toEqual({ status: 'PLAYING', winner: null, winningLine: [] });
  });

  it('2. Thắng hàng ngang (4 quân X liên tiếp)', () => {
    const board = emptyBoard();
    [0, 1, 2, 3].forEach((i) => (board[i] = 'X'));
    const res = checkGameResult(board);
    expect(res.status).toBe('WIN');
    expect(res.winner).toBe('X');
    expect(res.winningLine).toEqual([0, 1, 2, 3]);
  });

  it('3. Thắng hàng dọc (4 quân O liên tiếp)', () => {
    const board = emptyBoard();
    [1, 6, 11, 16].forEach((i) => (board[i] = 'O'));
    const res = checkGameResult(board);
    expect(res.status).toBe('WIN');
    expect(res.winner).toBe('O');
    expect(res.winningLine).toEqual([1, 6, 11, 16]);
  });

  it('4. Thắng chéo chính \\ (4 quân X liên tiếp)', () => {
    const board = emptyBoard();
    [0, 6, 12, 18].forEach((i) => (board[i] = 'X'));
    const res = checkGameResult(board);
    expect(res.status).toBe('WIN');
    expect(res.winner).toBe('X');
    expect(res.winningLine).toEqual([0, 6, 12, 18]);
  });

  it('5. Thắng chéo phụ / (4 quân O liên tiếp)', () => {
    const board = emptyBoard();
    [3, 7, 11, 15].forEach((i) => (board[i] = 'O'));
    const res = checkGameResult(board);
    expect(res.status).toBe('WIN');
    expect(res.winner).toBe('O');
    expect(res.winningLine).toEqual([3, 7, 11, 15]);
  });

  it('6. Không bị tính thắng nhầm khi gãy dòng (cuối hàng 0 + đầu hàng 1)', () => {
    const board = emptyBoard();
    [3, 4, 5, 6].forEach((i) => (board[i] = 'X'));
    const res = checkGameResult(board);
    expect(res.status).toBe('PLAYING');
    expect(res.winner).toBeNull();
  });

  it('7. Mới có 3 quân liên tiếp thì vẫn đang chơi', () => {
    const board = emptyBoard();
    [10, 11, 12].forEach((i) => (board[i] = 'X'));
    const res = checkGameResult(board);
    expect(res.status).toBe('PLAYING');
  });

  it('8. Đầy 25 ô không ai đủ 4 quân thì phải trả về DRAW', () => {
    const drawBoard: CellValue[] = [
      'X',
      'O',
      'X',
      'O',
      'X',
      'X',
      'O',
      'X',
      'O',
      'X',
      'O',
      'X',
      'O',
      'X',
      'O',
      'O',
      'X',
      'O',
      'X',
      'O',
      'X',
      'O',
      'X',
      'O',
      'X',
    ];
    const res = checkGameResult(drawBoard);
    expect(res).toEqual({ status: 'DRAW', winner: null, winningLine: [] });
  });
});
