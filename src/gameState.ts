import type { GameState } from './types';
import { PLAYS, LETTERS } from './types';

export const gameState: GameState = {
  currentRow: 0,
  currentCol: 0,
  guesses: [],
  isGameOver: false,
};

export { PLAYS, LETTERS };