import { useEffect, useRef } from 'react';
import {
  AiDifficulty,
  CellValue,
  GameMode,
  GameResult,
  Player,
  checkGameResult,
} from '@caro/shared';
import { gameService } from '../services/game.service';
import { useGameStore } from '../store/game.store';
import { useHistory } from './useHistory';
import { useAuth } from './useAuth';

export function useGame() {
  const board = useGameStore((state) => state.board);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const mode = useGameStore((state) => state.mode);
  const difficulty = useGameStore((state) => state.difficulty);
  const isAiThinking = useGameStore((state) => state.isAiThinking);
  const result = useGameStore((state) => state.result);

  const initGame = useGameStore((state) => state.initGame);
  const setBoard = useGameStore((state) => state.setBoard);
  const setCurrentTurn = useGameStore((state) => state.setCurrentTurn);
  const setAiThinking = useGameStore((state) => state.setAiThinking);
  const setResult = useGameStore((state) => state.setResult);
  const resetBoard = useGameStore((state) => state.resetBoard);

  const { addMatch } = useHistory();
  const { applyMatchOutcome } = useAuth();

  // Tăng token mỗi khi reset/start game để vô hiệu hóa phản hồi AI cũ đang bay về
  const sessionRef = useRef(0);

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
    };
  }, []);

  const finalizeMatchIfNeeded = (
    finalBoard: CellValue[],
    gameMode: GameMode,
    aiDiff: AiDifficulty,
    gameResult: GameResult,
  ) => {
    if (gameResult.status === 'PLAYING') return;

    const totalMoves = finalBoard.filter((cell) => cell !== null).length;
    addMatch({
      mode: gameMode,
      difficulty: gameMode === 'PVE' ? aiDiff : undefined,
      winner:
        gameResult.status === 'DRAW' ? 'DRAW' : (gameResult.winner ?? 'DRAW'),
      totalMoves,
    });

    if (gameMode === 'PVE') {
      if (gameResult.status === 'DRAW') {
        applyMatchOutcome('DRAW');
      } else if (gameResult.winner === 'X') {
        applyMatchOutcome('WIN');
      } else {
        applyMatchOutcome('LOSS');
      }
    }
  };

  const startNewGame = (
    nextMode: GameMode,
    nextDifficulty: AiDifficulty = 'medium',
  ) => {
    sessionRef.current += 1;
    initGame(nextMode, nextDifficulty);
  };

  const resetGame = () => {
    sessionRef.current += 1;
    resetBoard();
  };

  const makeMove = async (index: number) => {
    if (board[index] !== null || result.status !== 'PLAYING' || isAiThinking) {
      return;
    }

    const activeSession = sessionRef.current;
    const nextBoard = [...board];
    nextBoard[index] = currentTurn;
    const nextResult = checkGameResult(nextBoard);
    const nextTurn: Player = currentTurn === 'X' ? 'O' : 'X';

    setBoard(nextBoard);
    setCurrentTurn(nextTurn);
    setResult(nextResult);

    if (nextResult.status !== 'PLAYING') {
      finalizeMatchIfNeeded(nextBoard, mode, difficulty, nextResult);
      return;
    }

    if (mode === 'PVE' && nextTurn === 'O') {
      setAiThinking(true);
      try {
        const aiMoveIndex = await gameService.requestAiMove({
          board: nextBoard,
          aiPlayer: 'O',
          difficulty,
        });

        if (sessionRef.current !== activeSession) return;

        if (aiMoveIndex !== null && nextBoard[aiMoveIndex] === null) {
          const afterAiBoard = [...nextBoard];
          afterAiBoard[aiMoveIndex] = 'O';
          const afterAiResult = checkGameResult(afterAiBoard);

          setBoard(afterAiBoard);
          setCurrentTurn('X');
          setResult(afterAiResult);

          if (afterAiResult.status !== 'PLAYING') {
            finalizeMatchIfNeeded(
              afterAiBoard,
              mode,
              difficulty,
              afterAiResult,
            );
          }
        }
      } finally {
        if (sessionRef.current === activeSession) {
          setAiThinking(false);
        }
      }
    }
  };

  return {
    board,
    currentTurn,
    mode,
    difficulty,
    isAiThinking,
    result,
    startNewGame,
    makeMove,
    resetGame,
  };
}
