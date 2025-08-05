import './style.css';
import { state, initializeState, saveState } from './gameState';
import { LETTERS } from './types';
import * as board from './board';
import { submitGuess, restoreBoard } from './game';
import { createKeyboard } from './keyboard';

initializeState();

board.createBoard(handleboxClick);
createKeyboard(handleKeyPress);

restoreBoard();


if (!state.gameState.isGameOver) {
    board.CurrentBox(state.gameState.currentCol, state.gameState.currentRow);
}
document.addEventListener("keydown", handleKeyPress);

// Strategy Functions para cada tipo de tecla
function enterStrategy(): void {
    submitGuess();
    // Não precisa atualizar cursor aqui - submitGuess já faz isso
}

function backspaceStrategy(): void {
    const linhasElement = document.querySelector(`.row-${state.gameState.currentRow}`)!;
    const caixa = linhasElement.children[state.gameState.currentCol] as HTMLElement;
    
    if (state.gameState.currentCol > 0 && caixa.textContent == "") {
        state.gameState.currentCol--;
        board.updateBox("", state.gameState.currentRow, state.gameState.currentCol);
    } else if (state.gameState.currentCol >= 0 && caixa.textContent !== "") {
        board.updateBox("", state.gameState.currentRow, state.gameState.currentCol);
    }
    // CURSOR SERÁ ATUALIZADO NO FINAL do handleKeyPress
}

function arrowLeftStrategy(): void {
    if (state.gameState.currentCol > 0) {
        state.gameState.currentCol--;
    }
    // CURSOR SERÁ ATUALIZADO NO FINAL do handleKeyPress
}

function arrowRightStrategy(): void {
    if (state.gameState.currentCol < LETTERS - 1) {
        state.gameState.currentCol++;
    }
    // CURSOR SERÁ ATUALIZADO NO FINAL do handleKeyPress
}

function letterStrategy(key: string): void {
    if (state.gameState.currentCol < LETTERS) {
        board.updateBox(key, state.gameState.currentRow, state.gameState.currentCol);
        if (state.gameState.currentCol < LETTERS - 1) {
            state.gameState.currentCol++;
        }
    }
    // CURSOR SERÁ ATUALIZADO NO FINAL do handleKeyPress
}

// Dicionário de estratégias
const keyStrategies: Record<string, () => void> = {
    "enter": enterStrategy,
    "backspace": backspaceStrategy,
    "arrowleft": arrowLeftStrategy,
    "arrowright": arrowRightStrategy
};

// Função para verificar se é uma letra válida
function isValidLetter(key: string): boolean {
    return /^[a-z]$/.test(key);
}

function handleKeyPress(event: KeyboardEvent) {
    if (state.gameState.isGameOver) return;
    
    const key = event.key.toLowerCase();
    
    // Executa estratégia específica se existir no dicionário
    if (keyStrategies[key]) {
        keyStrategies[key]();
    }
    // Executa estratégia de letra se for uma letra válida
    else if (isValidLetter(key)) {
        letterStrategy(key);
    }
    // Se nenhuma estratégia foi executada, retorna sem atualizar cursor
    else {
        return;
    }
    
     if (!state.gameState.isGameOver) {
        board.CurrentBox(state.gameState.currentCol, state.gameState.currentRow);
    }
}

function handleboxClick(row: number, col: number) {
    if (state.gameState.isGameOver || row !== state.gameState.currentRow) return;
    
    state.gameState.currentCol = col;
    
    // ✅ Atualiza cursor após click
    board.CurrentBox(state.gameState.currentCol, state.gameState.currentRow);
}