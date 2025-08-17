// src/components/board.ts

import { PLAYS, LETTERS } from '../types';
// MUDANÇA: Importa o EventBus em vez do 'subscribe'
import { EventBus } from '../eventBus';
import { getState } from '../game/gameState';
import type { CurrentGameState } from '../types';
import { evaluateGuess } from '../game/game';
import { palavraCerta } from '../game/words';

const grid = document.getElementById("tabuleiro")!;

// --- FUNÇÃO DE RENDERIZAÇÃO ---
// Esta função não muda. Ela continua recebendo o estado e desenhando o tabuleiro.
function renderBoard(gameState: CurrentGameState) {
    for (let i = 0; i < PLAYS; i++) {
        const rowEl = grid.children[i] as HTMLElement;
        const guess = gameState.guesses[i] || "";
        
        const isSubmitted = i < gameState.currentRow || (i === gameState.currentRow && gameState.isComplete);
        const statuses = isSubmitted ? evaluateGuess(guess, palavraCerta) : [];

        for (let j = 0; j < LETTERS; j++) {
            const box = rowEl.children[j] as HTMLElement;
            box.textContent = guess[j] || "";
            
            box.className = 'box';

            if (isSubmitted && statuses[j]) {
                box.classList.add(statuses[j]);
            } else if (i === gameState.currentRow) {
                box.classList.add('box-active');
            } else {
                box.classList.add('box-inactive');
            }
        }
    }
    
    if (!gameState.isGameOver) {
        CurrentBox(gameState.currentCol, gameState.currentRow);
    } else {
        const cursor = document.querySelector('.cursor');
        if (cursor) cursor.classList.remove('cursor');
    }
}

// --- FUNÇÕES AUXILIARES ---
// Nenhuma mudança necessária aqui.
function CurrentBox(col: number, row: number) {
    const grid = document.getElementById("tabuleiro");
    if (!grid) return;

    // Remove a classe "cursor" de qualquer caixa que já a possua
    const prevCursor = grid.querySelector(".cursor");
    if (prevCursor) {
        prevCursor.classList.remove("cursor");
    }

    // Obtém a linha e, em seguida, a caixa correspondente à coluna atual
    const rowEl = grid.children[row] as HTMLElement;
    if (!rowEl) return;

    const box = rowEl.children[col] as HTMLElement;
    if (box) {
        box.classList.add("cursor");
    }
}

// Esta função atualiza uma caixa específica com a letra fornecida.
export function updateBox(letter: string, row: number, col: number) {
    const grid = document.getElementById("tabuleiro");
    if (!grid) return;

    const rowEl = grid.children[row] as HTMLElement;
    if (!rowEl) return;

    const box = rowEl.children[col] as HTMLElement;
    if (box) {
        box.textContent = letter;
    }
}

// --- FUNÇÃO DE CRIAÇÃO DO DOM ---
// Nenhuma mudança necessária aqui.
export function createBoard(handleClick: (row: number, col: number) => void) {
    const grid = document.getElementById("tabuleiro")!;
    grid.innerHTML = '';

    for (let row = 0; row < PLAYS; row++) {
        const rowEl = document.createElement('div');
        rowEl.classList.add('board-row');
        for (let col = 0; col < LETTERS; col++) {
            const box = document.createElement('div');
            box.classList.add('box', 'box-inactive');
            box.addEventListener('click', () => handleClick(row, col));
            rowEl.appendChild(box);
        }
        grid.appendChild(rowEl);
    }
}

// --- FUNÇÃO DE INICIALIZAÇÃO ---
// MUDANÇA: Troca 'subscribe' por 'EventBus.on'
export function initializeBoard(handleClick: (row: number, col: number) => void) {
   createBoard(handleClick);
    
    // O board agora "ouve" o evento específico 'stateChanged'.
    EventBus.on('stateChanged', () => {
        // A função interna (o callback) continua a mesma.
        renderBoard(getState().gameState);
    });

    // A renderização inicial continua igual.
    renderBoard(getState().gameState);
}