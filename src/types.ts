

export const PLAYS = 5;
export const LETTERS = 5;
export type GameModeType = "daily" | "random" | "timed";

export interface GameStats {
    gamesPlayed: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    winDistribution: { [key: number]: number };
}

export interface timedModeStats extends GameStats {
    score: number;
    timeTaken: number;
    maxScore: number;
    lastScore: number;
}

export interface RandomModeStats extends GameStats { }

export interface CurrentGameState {
    guesses: string[];
    currentRow: number;
    currentCol: number;
    isGameOver: boolean;
    isComplete: boolean;
    date?: string;
    currentWordIndex?: number;
    timeLeft?: number;
    isInteractionPaused?: boolean;
}

export interface SaveData {
    activeMode: GameModeType;

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
