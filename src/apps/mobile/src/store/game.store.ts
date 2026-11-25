import { create } from 'zustand';
import {
  AiDifficulty,
  CellValue,
  GameMode,
  GameResult,
  Player,
  TOTAL_CELLS,
} from '@caro/shared';

interface GameState {
  board: CellValue[];
  currentTurn: Player;
  mode: GameMode;
  difficulty: AiDifficulty;
  isAiThinking: boolean;
  result: GameResult;

  initGame: (mode: GameMode, difficulty?: AiDifficulty) => void;
  setBoard: (board: CellValue[]) => void;
  setCurrentTurn: (turn: Player) => void;
  setAiThinking: (thinking: boolean) => void;
  setResult: (result: GameResult) => void;
  resetBoard: () => void;
}

export const INITIAL_GAME_RESULT: GameResult = {
  status: 'PLAYING',
  winner: null,
  winningLine: [],
};

export const useGameStore = create<GameState>((set, get) => ({
  board: Array(TOTAL_CELLS).fill(null),
  currentTurn: 'X',
  mode: 'PVP_LOCAL',
  difficulty: 'medium',
  isAiThinking: false,
  result: INITIAL_GAME_RESULT,

  initGame: (mode, difficulty = 'medium') =>
    set({
      board: Array(TOTAL_CELLS).fill(null),
      currentTurn: 'X',
      mode,
      difficulty,
      isAiThinking: false,
      result: INITIAL_GAME_RESULT,
    }),

  setBoard: (board) => set({ board }),

  setCurrentTurn: (currentTurn) => set({ currentTurn }),

  setAiThinking: (isAiThinking) => set({ isAiThinking }),

  setResult: (result) => set({ result }),

  resetBoard: () => {
    const { mode, difficulty, initGame } = get();
    initGame(mode, difficulty);
  },
}));
