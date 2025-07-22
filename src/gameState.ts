import type { GameState } from './types';
import { PLAYS, LETTERS } from './types';

export const gameState: GameState = {
    currentRow: 0,
    currentCol: 0,
    guesses: [],
    isGameOver: false,
};

export const gameData = {
  stats: {
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    winDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }
  },
  gameState: {
    boardState: [] as string[], // Array com as palavras já tentadas
    solution: "",   // A palavra certa do dia
    rowIndex: 0,    // A linha atual
    isComplete: false, // Se o jogo do dia já foi finalizado
    currentCol: 0,  // Coluna atual
    gameDate: ""    // Data do jogo para verificar se é um novo dia
  }
};

// Função para obter a data atual no formato YYYY-MM-DD
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export { PLAYS, LETTERS };