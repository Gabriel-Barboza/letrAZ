// ===================================================================
// ===== TIPOS DE DADOS DA APLICAÇÃO =================================
// ===================================================================
// Define as "formas" dos nossos objetos de dados para garantir
// consistência e segurança de tipos em todo o projeto.

/** O status de uma letra em uma tentativa. */
export type LetterStatus = 'correct' | 'present' | 'absent';

/** Estatísticas que persistem entre os dias. */
export interface GameStats {
    gamesPlayed: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    winDistribution: { [key: number]: number };
}

/** O estado da partida atual. */
export interface CurrentGameState {
    guesses: string[];
    currentRow: number;
    currentCol: number;
    isGameOver: boolean;
    isComplete: boolean;
    date: string; // Data da partida atual (ex: "2025-07-26")
}

/** A estrutura completa que será salva no localStorage. */
export interface SaveData {
    stats: GameStats;
    gameState: CurrentGameState;
}
