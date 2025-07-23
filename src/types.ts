export const PLAYS = 5;
export const LETTERS = 5;

// Estatísticas que persistem entre os dias
export interface GameStats {
    gamesPlayed: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    winDistribution: { [key: number]: number };
}

// O estado da partida atual
export interface CurrentGameState {
    guesses: string[];
    currentRow: number;
    currentCol: number;
    isGameOver: boolean;
    isComplete: boolean;
    date: string; // Data da partida atual (ex: "2025-07-23")
}

// A estrutura completa que será salva no localStorage
export interface SaveData {
    stats: GameStats;
    gameState: CurrentGameState;
}