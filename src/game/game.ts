
import { palavraCerta, dicionarioValido } from "./words";
import { getState, setGameOver, advanceToNextRow } from "./gameState";
import { PLAYS, LETTERS } from "../types";

export interface SubmitResult {
    success: boolean;
    message?: string;
}

export function submitGuess(): SubmitResult {
    const currentState = getState();
    const guess = currentState.gameState.guesses[currentState.gameState.currentRow] || '';

    if (guess.length < LETTERS) {
        return { success: false, message: "Digite 5 letras." };
    }
    

    if (!dicionarioValido.has(guess)) {
        return { success: false, message: "Palavra inválida." };
    }

    const didWin = guess === palavraCerta;

    if (didWin) {
        setGameOver(true);
        return { success: true, message: "Parabéns, você acertou!" };
    }

    if (currentState.gameState.currentRow + 1 >= PLAYS) {
        setGameOver(false);
        return { success: true, message: `Fim de jogo! A palavra era: ${palavraCerta}` };
    }

    advanceToNextRow();
    return { success: true };
}

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