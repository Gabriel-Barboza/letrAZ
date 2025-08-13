// src/main.ts

// --- IMPORTS ---
import './components/style.css';
import { 
    initializeState, 
    getState, 
    updateCurrentGuess, 
    moveCursorLeft, 
    moveCursorRight,
    setCursorPosition
} from './game/gameState';
import { initializeBoard } from './components/board';
import { createKeyboard, updateKeyboardAppearance } from './components/keyboard';
import { submitGuess, type SubmitResult } from './game/game';
import { showMessage } from './components/toast';
import { LETTERS } from './types';

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
initializeState();
initializeBoard(handleboxClick);
createKeyboard(handleKeyPress);
updateKeyboardAppearance();


// --- LISTENER GLOBAL DE INPUT ---
document.addEventListener("keydown", handleKeyPress);


// --- ESTRATÉGIAS DE INPUT ---
// Estas funções definem o que fazer para cada tipo de ação.
function enterStrategy(): void {
    const result: SubmitResult = submitGuess();

    if (!result.success) {
        showMessage(result.message!, 'error');
        return;
    }
    
    updateKeyboardAppearance();

    if (result.message) {
        const messageType = result.message.includes("Parabéns") ? 'success' : 'error';
        showMessage(result.message, messageType, 4000);
    }
}

function backspaceStrategy(): void {
    const currentState = getState();
    let currentGuess = currentState.guesses[currentState.currentRow] || '';
    const pos = currentState.currentCol;
    if (pos < currentGuess.length) {
        const newGuess = currentGuess.slice(0, pos) + currentGuess.slice(pos + 1);
        updateCurrentGuess(newGuess);
      
    } else { 
       
        const newGuess = currentGuess.slice(0, pos - 1);
        updateCurrentGuess(newGuess);
        moveCursorLeft();
    }
}

function letterStrategy(key: string): void {
    const currentState = getState();
    let currentGuess = currentState.guesses[currentState.currentRow] || '';
    
    if (currentGuess.length < LETTERS) {
        const pos = currentState.currentCol;
        const newGuess = currentGuess.slice(0, pos) + key.toUpperCase() + currentGuess.slice(pos);
        updateCurrentGuess(newGuess);
        moveCursorRight();
    }
}

// --- O 'RECORD' DE ESTRATÉGIAS ---
// Mapeia a string da tecla para a função a ser executada.
// Note que para as setas, apontamos diretamente para as funções importadas do gameState.
const keyStrategies: Record<string, () => void> = {
    "enter": enterStrategy,
    "backspace": backspaceStrategy,
    "arrowleft": moveCursorLeft,
    "arrowright": moveCursorRight,
};

// --- CONTROLE DE INPUT ---
// A nova handleKeyPress, muito mais limpa.
function handleKeyPress(event: KeyboardEvent) {
    if (getState().isGameOver) return;
    
    const key = event.key.toLowerCase();
    
    // 1. Tenta encontrar e executar uma estratégia no Record
    const strategy = keyStrategies[key];
    if (strategy) {
        strategy();
        return; // Ação encontrada e executada, fim da função.
    }
    
    // 2. Se não encontrou, verifica se é uma letra
    if (/^[a-z]$/.test(key)) {
        letterStrategy(key);
    }
}

function handleboxClick(row: number, col: number) {
    if (getState().isGameOver || row !== getState().currentRow) return;
    
    setCursorPosition(col);
}