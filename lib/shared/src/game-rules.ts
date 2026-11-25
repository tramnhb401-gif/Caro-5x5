import { BOARD_SIZE, WIN_LENGTH } from './constants';
import { CellValue, GameResult } from './types';

const DIRECTIONS: [number, number][] = [
  [0, 1], // Ngang ->
  [1, 0], // Dọc v
  [1, 1], // Chéo chính \
  [1, -1], // Chéo phụ /
];

export function checkGameResult(
  board: CellValue[],
  boardSize: number = BOARD_SIZE,
  winLength: number = WIN_LENGTH,
): GameResult {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const startIndex = row * boardSize + col;
      const player = board[startIndex];
      if (!player) continue;

      for (const [dRow, dCol] of DIRECTIONS) {
        const line: number[] = [startIndex];

        for (let step = 1; step < winLength; step++) {
          const nextRow = row + dRow * step;
          const nextCol = col + dCol * step;

          // Vượt quá biên bàn cờ thì dừng hướng này
          if (
            nextRow < 0 ||
            nextRow >= boardSize ||
            nextCol < 0 ||
            nextCol >= boardSize
          ) {
            break;
          }

          const nextIndex = nextRow * boardSize + nextCol;
          if (board[nextIndex] !== player) break;

          line.push(nextIndex);
        }

        if (line.length === winLength) {
          return {
            status: 'WIN',
            winner: player,
            winningLine: line,
          };
        }
      }
    }
  }

  // Không ai thắng: nếu 25 ô đã kín thì Hòa, ngược lại vẫn đang chơi
  const isBoardFull = board.every((cell) => cell !== null);
  if (isBoardFull) {
    return { status: 'DRAW', winner: null, winningLine: [] };
  }

  return { status: 'PLAYING', winner: null, winningLine: [] };
}
