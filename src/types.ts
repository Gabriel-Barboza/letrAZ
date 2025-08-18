export const PLAYS = 5;
export const LETTERS = 5;

export interface GameStats {
    gamesPlayed: number;
    wins: number;
    currentStreak: number;
    maxStreak: number;
    winDistribution: { [key: number]: number };
    

}

export interface GameMode{
    gameType: 'daily' | 'timed' | 'random';
}

export interface timedModeStats extends GameStats {
    score: number;
    timeTaken: number;
    hintsUsed: number;
    maxScore: number;

}
export interface RandomModeStats extends GameStats {}


export interface CurrentGameState {
    guesses: string[];
    currentRow: number;
    currentCol: number;
    isGameOver: boolean;
    isComplete: boolean;
    date: string;
}

export interface SaveData {
    stats: GameStats;
    gameState: CurrentGameState;
    gameMode: GameMode;
    timedModeStats: timedModeStats;
    randomModeStats: RandomModeStats;
}