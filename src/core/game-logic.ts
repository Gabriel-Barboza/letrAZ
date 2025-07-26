// ===================================================================
// ===== LÓGICA CENTRAL DO JOGO ======================================
// ===================================================================
// Contém as regras e o fluxo principal do jogo, de forma pura,
// sem interagir diretamente com a UI.

import { state, saveState } from './state';
import { palavraCerta, tentativasValidas } from './word-service';
import { LETTERS, PLAYS } from '../config';
import type { LetterStatus } from '../types';

/**
 * Compara a tentativa com a palavra certa e retorna os status de cada letra.
 * @param guess A palavra da tentativa.
 * @returns Um array com o status de cada letra.
 */
export function checkGuess(guess: string): LetterStatus[] {
    // CORREÇÃO: Converte a tentativa para maiúsculas para garantir a comparação correta.
    const upperGuess = guess.toUpperCase();
    const target = palavraCerta.split('');
    const result: LetterStatus[] = Array(LETTERS).fill('absent');

    // Passo 1: Marcar as letras corretas (posição e letra)
    for (let i = 0; i < LETTERS; i++) {
        if (upperGuess[i] === target[i]) {
            result[i] = 'correct';
            target[i] = ''; // Esvazia para não ser contado novamente
        }
    }

    // Passo 2: Marcar as letras presentes (letra existe, mas em outra posição)
    for (let i = 0; i < LETTERS; i++) {
        if (result[i] === 'correct') continue; // Já foi marcada

        const index = target.indexOf(upperGuess[i]);
        if (index !== -1) {
            result[i] = 'present';
            target[index] = ''; // Esvazia para não ser contado novamente
        }
    }

    return result;
}

/**
 * Valida se a palavra da tentativa é aceitável.
 * @param guess A palavra a ser validada.
 * @returns Um objeto com o resultado da validação.
 */
export function validateGuess(guess: string): { isValid: boolean; message?: string } {
    if (guess.length < LETTERS) {
        return { isValid: false, message: `Digite ${LETTERS} letras.` };
    }
    if (!tentativasValidas.includes(guess.toUpperCase())) {
        return { isValid: false, message: 'Palavra não encontrada.' };
    }
    return { isValid: true };
}

/**
 * Atualiza as estatísticas do jogador após o fim de um jogo.
 * @param didWin Se o jogador venceu a partida.
 */
function updateStats(didWin: boolean) {
    state.stats.gamesPlayed++;
    if (didWin) {
        state.stats.wins++;
        state.stats.currentStreak++;
        state.stats.maxStreak = Math.max(state.stats.maxStreak, state.stats.currentStreak);
        // +1 porque currentRow é base 0
        state.stats.winDistribution[state.gameState.currentRow + 1]++;
    } else {
        state.stats.currentStreak = 0;
    }
}

/**
 * Processa a submissão de uma tentativa.
 * @param guess A palavra enviada pelo jogador.
 * @returns Um objeto indicando o resultado do jogo (win, loss, continue).
 */
export function processGuess(guess: string) {
    state.gameState.guesses[state.gameState.currentRow] = guess;

    // Verifica se o jogador ganhou
    if (guess.toUpperCase() === palavraCerta) {
        state.gameState.isGameOver = true;
        state.gameState.isComplete = true;
        updateStats(true);
        saveState();
        return { outcome: 'win' as const };
    }

    // Passa para a próxima linha
    state.gameState.currentRow++;
    state.gameState.currentCol = 0;

    // Verifica se o jogador perdeu (acabaram as tentativas)
    if (state.gameState.currentRow >= PLAYS) {
        state.gameState.isGameOver = true;
        state.gameState.isComplete = true;
        updateStats(false);
        saveState();
        return { outcome: 'loss' as const };
    }

    // Se o jogo continua, apenas salva o estado
    saveState();
    return { outcome: 'continue' as const };
}
