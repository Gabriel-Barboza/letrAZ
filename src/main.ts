// src/main.ts

import './components/style.css';
import { 
    initializeState, 
    getActiveGameState,
    updateCurrentGuess, 
    moveCursorLeft, 
    moveCursorRight,
    setCursorPosition,
    setActiveGameMode,
    resetGameStateForNewGame,
} from './game/gameState';
import { initializeBoard } from './components/board'; 
import { createKeyboard , updateKeyboardAppearance} from './components/keyboard'; 
import { submitGuess } from './game/game';
import { showMessage } from './components/toast';
import { LETTERS, type GameModeType } from './types'; // ATUALIZADO
import { getDailyWord, selectRandomWord, setPalavraCerta, palavraCerta } from './game/words';
import { EventBus } from './eventBus';

function startGame(mode: GameModeType) { // ATUALIZADO
    setActiveGameMode(mode);
    updateHeader(mode);
    
    const word = (mode === 'daily') ? getDailyWord() : selectRandomWord();
    setPalavraCerta(word);

    // Só reseta o jogo se NÃO for o modo diário.
    if (mode !== 'daily') {
        resetGameStateForNewGame();
    }
    
    // Força a UI a recarregar com o estado correto
    EventBus.emit('stateChanged'); 
    updateKeyboardAppearance();

    console.log(`Novo jogo iniciado no modo '${mode}'. Palavra: ${palavraCerta}`);
}

function updateHeader(mode: GameModeType) { // ATUALIZADO
    const headerLink = document.getElementById("headerLink");
    if (headerLink) {
        if (mode === 'daily') headerLink.textContent = "LetrAZ Diário";
        if (mode === 'random') headerLink.textContent = "LetrAZ Infinito";
        if (mode === 'timed') headerLink.textContent = "LetrAZ Rush";
    }
}

// ----- LÓGICA DE INICIALIZAÇÃO SIMPLIFICADA -----
initializeState();
startGame('daily'); 
initializeBoard(handleboxClick);
createKeyboard(handleKeyPress);

// Inicia o jogo no modo diário por padrão.
// Esta chamada única substitui a lógica de inicialização anterior, tornando-a mais limpa.

// -------------------------------------------------


// ----- CONFIGURAÇÃO DE EVENTOS -----
const modeModal = document.getElementById("modeModal");
const modeModalButton = document.getElementById("modeModalButton");
modeModal?.classList.remove("hidden");
modeModalButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    modeModal?.classList.remove("hidden");
});

document.addEventListener('click', () => {
    modeModal?.classList.add("hidden");
});
EventBus.emit('initialStateLoaded'); 
document.addEventListener("keydown", handleKeyPress);
document.getElementById('daily-mode-btn')?.addEventListener('click', () => startGame('daily'));
document.getElementById('timed-mode-btn')?.addEventListener('click', () => startGame('timed'));
document.getElementById('random-mode-btn')?.addEventListener('click', () => startGame('random'));


// ----- FUNÇÕES DE INTERAÇÃO (JÁ ESTAVAM CORRETAS) -----

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

function backspaceStrategy(): void {
    const currentState = getActiveGameState();
    const pos = currentState.currentCol;
    const currentGuess = currentState.guesses[currentState.currentRow] || '';
    const paddedGuess = currentGuess.padEnd(LETTERS, ' ');

    if (pos < LETTERS && paddedGuess.charAt(pos) !== ' ') {
 
        const newGuess = paddedGuess.slice(0, pos) + ' ' + paddedGuess.slice(pos + 1);
        updateCurrentGuess(newGuess.trimEnd());
        
        setCursorPosition(pos); 
        return;
    }

 
    if (pos > 0) {

        const newGuess = paddedGuess.slice(0, pos - 1) + ' ' + paddedGuess.slice(pos);
        updateCurrentGuess(newGuess.trimEnd());

        moveCursorLeft();
    }
}
function letterStrategy(key: string): void {
    const currentState = getActiveGameState();
    const pos = currentState.currentCol;
    if (pos >= LETTERS) return;
    let currentGuess = currentState.guesses[currentState.currentRow] || '';
    const letter = key.toUpperCase();
    if (currentGuess.length < pos) {
        currentGuess = currentGuess.padEnd(pos, ' ');
    }
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
    if (getActiveGameState().isGameOver) return;
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
    const currentState = getActiveGameState();
    if (currentState.isGameOver || row !== currentState.currentRow) return;
    setCursorPosition(col);
}