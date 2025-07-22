export type GameState = {
    currentRow: number;
    currentCol: number;
    guesses: string[];
    isGameOver: boolean;
};

export const PLAYS = 5;
export const LETTERS = 5;