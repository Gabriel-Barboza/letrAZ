// src/types.ts

export const PLAYS = 5;
export const LETTERS = 5;

// Tipo para definir os modos de jogo possíveis. Fica mais seguro do que usar strings soltas.
export type GameModeType = 'daily' | 'random' | 'timed';

// --- ESTATÍSTICAS ---

// Interface base para as estatísticas de qualquer modo de jogo.
export interface GameStats {
    gamesPlayed: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    winDistribution: { [key: number]: number };
}

// Estatísticas específicas para o Modo Rush (herda as estatísticas base).
export interface timedModeStats extends GameStats {
    score: number;
    timeTaken: number;
    hintsUsed: number;
    maxScore: number;
}

// Estatísticas para o Modo Livre (atualmente, são as mesmas da base).
export interface RandomModeStats extends GameStats {}


// --- ESTADO DO JOGO ---

// Interface que define a estrutura do tabuleiro de um único jogo.
export interface CurrentGameState {
    guesses: string[];
    currentRow: number;
    currentCol: number;
    isGameOver: boolean;
    isComplete: boolean;
    date: string;
}


// --- ESTRUTURA PRINCIPAL DE DADOS ---

// A "planta" principal e organizada de tudo que será salvo.
export interface SaveData {
    // Apenas qual modo está ativo no momento.
    activeMode: GameModeType;

    // Um objeto que agrupa todas as informações por modo de jogo.
    modes: {
        daily: {
            stats: GameStats;
            gameState: CurrentGameState;
        };
        random: {
            stats: RandomModeStats;
            gameState: CurrentGameState;
        };
        timed: {
            stats: timedModeStats;
            gameState: CurrentGameState;
        };
    };
}