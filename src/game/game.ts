// src/game/game.ts

import { palavraCerta, dicionarioValido } from "./words";
// 1. ATUALIZADO: Importamos o novo "helper" e removemos o antigo "getState".
import { getActiveGameState, setGameOver, advanceToNextRow } from "./gameState";
import { PLAYS, LETTERS } from "../types";

export interface SubmitResult {
    isValid: boolean;
    isWin: boolean;
    message?: string;
}

// 2. ATUALIZADO: Esta função agora usa getActiveGameState() para obter os dados corretos.
export function submitGuess(): SubmitResult {
    const activeGameState = getActiveGameState();
    const guess = activeGameState.guesses[activeGameState.currentRow] || '';

    if (guess.length < LETTERS) {
        return { isValid: false, isWin: false, message: "Digite 5 letras." };
    }
    
    if (!dicionarioValido.has(guess)) {
        return { isValid: false, isWin: false, message: "Palavra inválida." };
    }

    const isWin = guess === palavraCerta;

    return { isValid: true, isWin: isWin };
}
// Nenhuma mudança necessária aqui. Esta função não depende do estado do jogo.
export function evaluateGuess(guess: string, answer: string): ("correct" | "present" | "absent")[] {
    const result: ("correct" | "present" | "absent")[] = Array(LETTERS).fill("absent");
    const answerLetters = answer.split('');
    const guessLetters = guess.split('');

    for (let i = 0; i < LETTERS; i++) {
        if (guessLetters[i] === answerLetters[i]) {
            result[i] = "correct";
            answerLetters[i] = '';
        }
    }

    for (let i = 0; i < LETTERS; i++) {
        if (result[i] === "correct") continue;
        const letterIndexInAnswer = answerLetters.indexOf(guessLetters[i]);
        if (letterIndexInAnswer !== -1) {
            result[i] = "present";
            answerLetters[letterIndexInAnswer] = '';
        }
    }
    return result;
}

// Nenhuma mudança necessária aqui. Os "guesses" são passados como parâmetro.
export function calculateAllKeyStatuses(guesses: string[], answer: string): Record<string, "correct" | "present" | "absent"> {
    const keyStatus: Record<string, "correct" | "present" | "absent"> = {};
    const relevantGuesses = guesses.filter(g => g);

    for (const guess of relevantGuesses) {
        const statuses = evaluateGuess(guess, answer);
        for (let i = 0; i < guess.length; i++) {
            const letter = guess[i].toLowerCase();
            const currentStatus = keyStatus[letter];
            const newStatus = statuses[i];

            if (newStatus === 'correct') {
                keyStatus[letter] = 'correct';
            } else if (newStatus === 'present' && currentStatus !== 'correct') {
                keyStatus[letter] = 'present';
            } else if (newStatus === 'absent' && !currentStatus) {
                keyStatus[letter] = 'absent';
            }
        }
    }
    return keyStatus;
}
export function calculateRushModeScore(guess: string, answer: string, currentRow: number, timeLeft: number): number {
    const letterStatuses = evaluateGuess(guess, answer);

    // 1. Calcula os Pontos de Letra
    let letterPoints = 0;
    for (const status of letterStatuses) {
        if (status === 'correct') {
            letterPoints += 3;
        } else if (status === 'present') {
            letterPoints += 1;
        }
    }

    // 2. Calcula o Multiplicador de Linha
    const rowMultiplier = PLAYS - currentRow; // Linha 0 -> 5, Linha 1 -> 4, etc.

    // 3. Calcula o Multiplicador de Tempo
    let timeMultiplier = 1;
    if (timeLeft >= 10) {
        timeMultiplier = 3;
    } else if (timeLeft >= 5) {
        timeMultiplier = 2;
    }

    // Calcula a pontuação base do palpite
    let guessScore = letterPoints * rowMultiplier * timeMultiplier;

    // 4. Aplica o Bônus de Acerto
    const didWin = guess === answer;
    if (didWin) {
        guessScore *= 5;
    }

    return guessScore;
}