// src/main.ts

import './components/style.css';
import { 
    initializeState, 
    getState, 
    updateCurrentGuess, 
    moveCursorLeft, 
    moveCursorRight,
    setCursorPosition,
    setActiveGameMode,
    resetGameStateForNewGame
} from './game/gameState';
import { initializeBoard } from './components/board'; 
import { createKeyboard } from './components/keyboard'; 
import { submitGuess, type SubmitResult } from './game/game';
import { showMessage } from './components/toast';
import { LETTERS, type GameMode } from './types';
import { getDailyWord, selectRandomWord, setPalavraCerta, palavraCerta } from './game/words';
import { EventBus } from './eventBus';

function startGame(mode: GameMode['gameType']) {
    setActiveGameMode(mode);
    const word = (mode === 'daily') ? getDailyWord() : selectRandomWord();
    setPalavraCerta(word);
    resetGameStateForNewGame();
    console.log(`Novo jogo iniciado no modo '${mode}'. Palavra: ${palavraCerta}`);
}

// --- INICIALIZAÇÃO ---
initializeState();
const initialData = getState();
const initialWord = (initialData.gameMode.gameType === 'daily') ? getDailyWord() : selectRandomWord();
setPalavraCerta(initialWord);

initializeBoard(handleboxClick);
createKeyboard(handleKeyPress);
EventBus.emit('initialStateLoaded'); 
EventBus.emit('stateChanged'); // Emite evento para renderização inicial

// --- LISTENERS ---
document.addEventListener("keydown", handleKeyPress);
// Adicione botões com estes IDs no seu HTML
document.getElementById('daily-mode-btn')?.addEventListener('click', () => startGame('daily'));
document.getElementById('timed-mode-btn')?.addEventListener('click', () => startGame('timed'));
document.getElementById('random-mode-btn')?.addEventListener('click', () => startGame('random'));

function enterStrategy(): void {
    const result = submitGuess();

    if (!result.success) {
        showMessage(result.message!, 'error');
        return;
    }
    
    if (result.message) {
        const messageType = result.message.includes("Parabéns") ? 'success' : 'error';
        showMessage(result.message, messageType, 4000);
    }
}

// Em src/main.ts, SUBSTITUA a função backspaceStrategy por esta:

function backspaceStrategy(): void {
    const currentState = getState().gameState;
    const currentGuess = currentState.guesses[currentState.currentRow] || '';

    // Se não houver nada para apagar, não faz nada
    if (currentGuess.length === 0) {
        return;
    }
    
    // Remove o último caractere da palavra
    const newGuess = currentGuess.slice(0, -1);
    updateCurrentGuess(newGuess);
    
    // Move o cursor para o novo final da palavra
    setCursorPosition(newGuess.length);
}

function letterStrategy(key: string): void {
    const currentState = getState().gameState;
    const pos = currentState.currentCol;

    if (pos >= LETTERS) {
        return; // Impede a digitação além do limite de 5 letras
    }

    let currentGuess = currentState.guesses[currentState.currentRow] || '';
    const letter = key.toUpperCase();

    // --- LÓGICA CORRIGIDA ---

    // 1. Se o cursor estiver à frente do final da palavra, 
    //    preenchemos o espaço com " " (espaços) até a posição do cursor.
    if (currentGuess.length < pos) {
        currentGuess = currentGuess.padEnd(pos, ' ');
    }

    // 2. Agora que os espaços foram criados, a lógica de substituição/inserção funciona perfeitamente.
    const newGuess = currentGuess.slice(0, pos) + letter + currentGuess.slice(pos + 1);

    updateCurrentGuess(newGuess.slice(0, LETTERS));
    moveCursorRight();
}

const keyStrategies: Record<string, () => void> = {
    "enter": enterStrategy,
    "backspace": backspaceStrategy,
    "arrowleft": moveCursorLeft,
    "arrowright": moveCursorRight,
};

function handleKeyPress(event: KeyboardEvent) {
    if (getState().gameState.isGameOver) return;
    const key = event.key.toLowerCase();
    
    const strategy = keyStrategies[key];
    if (strategy) {
        strategy();
        return;
    }
    
    if (/^[a-z]$/.test(key)) {
        letterStrategy(key);
    }
}

function handleboxClick(row: number, col: number) {
    const currentState = getState().gameState;
    if (currentState.isGameOver || row !== currentState.currentRow) return;
    
    setCursorPosition(col);
}
