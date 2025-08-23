// src/game/game.ts

import { palavraCerta, dicionarioValido } from "./words";
import { getActiveGameState } from "./gameState";
import { PLAYS, LETTERS } from "../types";

export interface SubmitResult {
    isValid: boolean;
    isWin: boolean;
    message?: string;
}

export function submitGuess(): SubmitResult {
    const activeGameState = getActiveGameState();
    const guess = activeGameState.guesses[activeGameState.currentRow] || "";

    if (guess.length < LETTERS) {
        return { isValid: false, isWin: false, message: "Digite 5 letras." };
    }

    if (!dicionarioValido.has(guess)) {
        return { isValid: false, isWin: false, message: "Palavra inválida." };
    }

    const isWin = guess === palavraCerta;

    return { isValid: true, isWin: isWin };
}
export function evaluateGuess(
    guess: string,
    answer: string
): ("correct" | "present" | "absent")[] {
    const result: ("correct" | "present" | "absent")[] =
        Array(LETTERS).fill("absent");
    const answerLetters = answer.split("");
    const guessLetters = guess.split("");

    for (let i = 0; i < LETTERS; i++) {
        if (guessLetters[i] === answerLetters[i]) {
            result[i] = "correct";
            answerLetters[i] = "";
        }
    }

    for (let i = 0; i < LETTERS; i++) {
        if (result[i] === "correct") continue;
        const letterIndexInAnswer = answerLetters.indexOf(guessLetters[i]);
        if (letterIndexInAnswer !== -1) {
            result[i] = "present";
            answerLetters[letterIndexInAnswer] = "";
        }
    }
    return result;
}

export function calculateAllKeyStatuses(
    guesses: string[],
    answer: string
): Record<string, "correct" | "present" | "absent"> {
    const keyStatus: Record<string, "correct" | "present" | "absent"> = {};
    const relevantGuesses = guesses.filter((g) => g);

    for (const guess of relevantGuesses) {
        const statuses = evaluateGuess(guess, answer);
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i].toLowerCase();
            const currentStatus = keyStatus[letter];
            const newStatus = statuses[i];

            if (newStatus === "correct") {
                keyStatus[letter] = "correct";
            } else if (newStatus === "present" && currentStatus !== "correct") {
                keyStatus[letter] = "present";
            } else if (newStatus === "absent" && !currentStatus) {
                keyStatus[letter] = "absent";
            }
        }
    }
    return keyStatus;
}
export function calculateRushModeScore(
    guess: string,
    answer: string,
    currentRow: number,
    timeLeft: number
): number {
    const letterStatuses = evaluateGuess(guess, answer);

    let letterPoints = 0;
    for (const status of letterStatuses) {
        if (status === "correct") {
            letterPoints += 3;
        } else if (status === "present") {
            letterPoints += 1;
        }
    }

    const rowMultiplier = PLAYS - currentRow;

let timeMultiplier = 1;
    if (timeLeft >= 20) {      
        timeMultiplier = 5;
    } else if (timeLeft >= 15) { 
        timeMultiplier = 4;
    } else if (timeLeft >= 10) { 
        timeMultiplier = 3;
    } else if (timeLeft >= 5) { 
        timeMultiplier = 2;
    }

    let guessScore = letterPoints * rowMultiplier * timeMultiplier;

    const didWin = guess === answer;
    if (didWin) {
        guessScore *= 5;
    }

    return guessScore;
}
