// src/components/board.ts

import { PLAYS, LETTERS } from '../types';
import { EventBus } from '../eventBus';
import { getActiveGameState } from '../game/gameState';
import type { CurrentGameState } from '../types';
import { evaluateGuess } from '../game/game';
import { palavraCerta } from '../game/words';

let grid: HTMLElement;

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
            } else if (i === gameState.currentRow && !gameState.isInteractionPaused) { 
                box.classList.add('box-active');
            } else {
                box.classList.add('box-inactive');
            }
        }
    }
 if (!gameState.isGameOver && !gameState.isInteractionPaused) {
        CurrentBox(gameState.currentCol, gameState.currentRow);
    } else {
        const cursor = document.querySelector('.cursor');
        if (cursor) cursor.classList.remove('cursor');
    }
}

function CurrentBox(col: number, row: number) {
    if (!grid) return;
    const prevCursor = grid.querySelector(".cursor");
    if (prevCursor) {
        prevCursor.classList.remove("cursor");
    }
    const rowEl = grid.children[row] as HTMLElement;
    if (!rowEl) return;
    const box = rowEl.children[col] as HTMLElement;
    if (box) {
        box.classList.add("cursor");
    }
}

export function createBoard(handleClick: (row: number, col: number) => void) {
    const gridElement = document.getElementById("tabuleiro");
    if (!gridElement) {
        console.error("ERRO GRAVE: Não foi possível encontrar o <div id='tabuleiro'> no seu index.html.");
        return;
    }
    grid = gridElement;
    
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

export function initializeBoard(handleClick: (row: number, col: number) => void) {
    createBoard(handleClick);
    EventBus.on('stateChanged', () => {
        renderBoard(getActiveGameState());
    });
    renderBoard(getActiveGameState());
}