import { BadRequestException, Injectable } from '@nestjs/common';
import type { AiDifficulty, CellValue, Player } from '@caro/shared';

const BOARD_SIZE = 5;
const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
const WIN_LENGTH = 4;

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];
const LINE_VALUES = [0, 3, 18, 180, 1_000_000];

@Injectable()
export class GetAiMoveUseCase {
  execute(
    board: CellValue[],
    aiPlayer: Player,
    difficulty: AiDifficulty,
  ): { move_index: number | null } {
    this.validate(board, aiPlayer, difficulty);
    const legalMoves = board.flatMap((cell, index) =>
      cell === null ? [index] : [],
    );
    if (legalMoves.length === 0) return { move_index: null };
    if (difficulty === 'easy') {
      return {
        move_index: legalMoves[Math.floor(Math.random() * legalMoves.length)],
      };
    }

    const opponent = this.otherPlayer(aiPlayer);
    const winNow = legalMoves.find((index) =>
      this.winsAt(board, index, aiPlayer),
    );
    if (winNow !== undefined) return { move_index: winNow };

    const blockNow = legalMoves.find((index) =>
      this.winsAt(board, index, opponent),
    );
    if (blockNow !== undefined) return { move_index: blockNow };

    if (difficulty === 'medium') {
      return { move_index: this.bestStaticMove(board, legalMoves, aiPlayer) };
    }
    return { move_index: this.bestSearchMove(board, legalMoves, aiPlayer) };
  }

  private validate(
    board: CellValue[],
    aiPlayer: Player,
    difficulty: AiDifficulty,
  ) {
    if (
      !Array.isArray(board) ||
      board.length !== TOTAL_CELLS ||
      board.some((cell) => cell !== null && cell !== 'X' && cell !== 'O')
    ) {
      throw new BadRequestException(`board phải có ${TOTAL_CELLS} ô hợp lệ.`);
    }
    if (aiPlayer !== 'X' && aiPlayer !== 'O') {
      throw new BadRequestException('ai_player không hợp lệ.');
    }
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      throw new BadRequestException('difficulty không hợp lệ.');
    }
  }

  private winsAt(board: CellValue[], index: number, player: Player): boolean {
    const next = [...board];
    next[index] = player;
    return this.getWinner(next) === player;
  }

  private bestStaticMove(
    board: CellValue[],
    moves: number[],
    player: Player,
  ): number {
    const opponent = this.otherPlayer(player);
    return moves.reduce(
      (best, index) => {
        const next = [...board];
        next[index] = player;
        const ownScore = this.evaluate(next, player);
        const opponentScore = this.evaluate(next, opponent);
        const score = ownScore + opponentScore * 0.9 + this.centerBonus(index);
        return score > best.score ? { index, score } : best;
      },
      { index: moves[0], score: Number.NEGATIVE_INFINITY },
    ).index;
  }

  private bestSearchMove(
    board: CellValue[],
    moves: number[],
    player: Player,
  ): number {
    const ordered = this.orderMoves(board, moves, player).slice(0, 7);
    let bestIndex = ordered[0];
    let bestScore = Number.NEGATIVE_INFINITY;
    let alpha = Number.NEGATIVE_INFINITY;
    const beta = Number.POSITIVE_INFINITY;
    const opponent = this.otherPlayer(player);

    for (const index of ordered) {
      const next = [...board];
      next[index] = player;
      const score = this.minimax(next, 2, alpha, beta, false, player, opponent);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
      alpha = Math.max(alpha, bestScore);
    }
    return bestIndex;
  }

  private minimax(
    board: CellValue[],
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean,
    aiPlayer: Player,
    opponent: Player,
  ): number {
    const winner = this.getWinner(board);
    if (winner) {
      return winner === aiPlayer ? 10_000 + depth : -10_000 - depth;
    }
    if (board.every((cell) => cell !== null) || depth === 0) {
      return this.evaluate(board, aiPlayer) - this.evaluate(board, opponent);
    }

    const player = maximizing ? aiPlayer : opponent;
    const moves = board.flatMap((cell, index) =>
      cell === null ? [index] : [],
    );
    const candidates = this.orderMoves(board, moves, player).slice(0, 7);
    if (maximizing) {
      let value = Number.NEGATIVE_INFINITY;
      for (const index of candidates) {
        const next = [...board];
        next[index] = player;
        value = Math.max(
          value,
          this.minimax(next, depth - 1, alpha, beta, false, aiPlayer, opponent),
        );
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
      }
      return value;
    }

    let value = Number.POSITIVE_INFINITY;
    for (const index of candidates) {
      const next = [...board];
      next[index] = player;
      value = Math.min(
        value,
        this.minimax(next, depth - 1, alpha, beta, true, aiPlayer, opponent),
      );
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return value;
  }

  private orderMoves(
    board: CellValue[],
    moves: number[],
    player: Player,
  ): number[] {
    const opponent = this.otherPlayer(player);
    return [...moves].sort((left, right) => {
      const leftBoard = [...board];
      leftBoard[left] = player;
      const rightBoard = [...board];
      rightBoard[right] = player;
      const leftScore =
        this.evaluate(leftBoard, player) +
        this.evaluate(leftBoard, opponent) * 0.9 +
        this.centerBonus(left);
      const rightScore =
        this.evaluate(rightBoard, player) +
        this.evaluate(rightBoard, opponent) * 0.9 +
        this.centerBonus(right);
      return rightScore - leftScore;
    });
  }

  private evaluate(board: CellValue[], player: Player): number {
    let score = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        for (const [dRow, dCol] of DIRECTIONS) {
          const endRow = row + (WIN_LENGTH - 1) * dRow;
          const endCol = col + (WIN_LENGTH - 1) * dCol;
          if (
            endRow < 0 ||
            endRow >= BOARD_SIZE ||
            endCol < 0 ||
            endCol >= BOARD_SIZE
          ) {
            continue;
          }
          let own = 0;
          let blocked = false;
          for (let offset = 0; offset < WIN_LENGTH; offset++) {
            const cell =
              board[(row + offset * dRow) * BOARD_SIZE + col + offset * dCol];
            if (cell !== null && cell !== player) {
              blocked = true;
              break;
            }
            if (cell === player) own++;
          }
          if (!blocked) score += LINE_VALUES[own];
        }
      }
    }
    return score;
  }

  private centerBonus(index: number): number {
    const center = (BOARD_SIZE - 1) / 2;
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    return BOARD_SIZE - Math.abs(center - row) - Math.abs(center - col);
  }

  private getWinner(board: CellValue[]): Player | null {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const player = board[row * BOARD_SIZE + col];
        if (!player) continue;
        for (const [dRow, dCol] of DIRECTIONS) {
          let count = 1;
          for (let offset = 1; offset < WIN_LENGTH; offset++) {
            const nextRow = row + offset * dRow;
            const nextCol = col + offset * dCol;
            if (
              nextRow < 0 ||
              nextRow >= BOARD_SIZE ||
              nextCol < 0 ||
              nextCol >= BOARD_SIZE ||
              board[nextRow * BOARD_SIZE + nextCol] !== player
            ) {
              break;
            }
            count++;
          }
          if (count === WIN_LENGTH) return player;
        }
      }
    }
    return null;
  }

  private otherPlayer(player: Player): Player {
    return player === 'X' ? 'O' : 'X';
  }
}
