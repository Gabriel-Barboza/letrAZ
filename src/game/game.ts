import { palavraCerta, tentativasValidasFiltradas, respostasFiltradas } from "./words";
import { state, setGameOver, advanceToNextRow } from "./gameState";
import { PLAYS, LETTERS } from "../types";


export interface SubmitResult {
    success: boolean;
    message?: string;
}


/** Colore a linha da tentativa e o teclado virtual com base no resultado. */
export function evaluateGuess(guess: string, answer: string) : ("correct" | "present" | "absent")[] {
 const result: ("correct" | "present" | "absent")[] = Array(LETTERS).fill("absent");
    const answerLetters = answer.split('');
    const guessLetters = guess.split('');

    // Passo 1: Marcar as letras "corretas"
    for (let i = 0; i < LETTERS; i++) {
        if (guessLetters[i] === answerLetters[i]) {
            result[i] = "correct";
            answerLetters[i] = ''; // Marca a letra da resposta como "usada"
        }
    }

    // Passo 2: Marcar as letras "presentes"
    for (let i = 0; i < LETTERS; i++) {
        if (result[i] === "correct") continue;

        const letterIndexInAnswer = answerLetters.indexOf(guessLetters[i]);
        if (letterIndexInAnswer !== -1) {
            result[i] = "present";
            answerLetters[letterIndexInAnswer] = ''; // Marca a letra da resposta como "usada"
        }
    }

    return result; // A função agora RETORNA o resultado
}
/** Função principal chamada quando o jogador aperta Enter. */
export function submitGuess(): SubmitResult {
    // 1. Apenas lê o palpite que já deve estar no estado
    const guess = state.gameState.guesses[state.gameState.currentRow] || '';

    // 2. Validações (isso é lógica, então fica aqui)
    if (guess.length < LETTERS) {
        return { success: false, message: "Digite 5 letras." };
    }
    if (!tentativasValidasFiltradas.includes(guess) && !respostasFiltradas.includes(guess)) {
        return { success: false, message: "Palavra inválida." };
    }

    // 3. Delega as mudanças de estado para o módulo gameState
    // A UI será notificada e se atualizará sozinha a partir daqui
    if (guess === palavraCerta) {
        setGameOver(true); // Informa ao estado que o jogo acabou com vitória
        return { success: true, message: "Parabéns, você acertou!" };
    }

    if (state.gameState.currentRow + 1 >= PLAYS) {
        setGameOver(false); // Informa ao estado que o jogo acabou com derrota
        return { success: true, message: `Fim de jogo! A palavra era: ${palavraCerta}` };
    }

    advanceToNextRow(); // Apenas avança a linha se o jogo continuar
    return { success: true };
}


export function calculateAllKeyStatuses(guesses: string[], answer:string): Record<string, "correct" | "present" | "absent"> {
    const keyStatus: Record<string, "correct" | "present" | "absent"> = {};

    for (const guess of guesses) {
        if (!guess) continue;
        const statuses = evaluateGuess(guess, answer); // Chama a função no mesmo arquivo

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


