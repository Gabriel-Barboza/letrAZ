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
    resetGameStateForNewGame,
    modoDeJogo
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
    modeModal?.classList.add("hidden");
    const word = (mode === 'daily') ? getDailyWord() : selectRandomWord();
    setPalavraCerta(word);
    resetGameStateForNewGame();
    console.log(`Novo jogo iniciado no modo '${mode}'. Palavra: ${palavraCerta}`);

}

initializeState();

const headerLink = document.getElementById("headerLink");




const initialData = getState();

const initialWord = (initialData.gameMode.gameType === 'daily') ? getDailyWord() : selectRandomWord();
setPalavraCerta(initialWord);

initializeBoard(handleboxClick);
createKeyboard(handleKeyPress);
EventBus.emit('initialStateLoaded'); 
EventBus.emit('stateChanged');

const modeModal = document.getElementById("modeModal");

    modeModal?.classList.remove("hidden");

const modeModalButton = document.getElementById("modeModalButton");


document.addEventListener('click', (event) => {
    event.stopPropagation();
    modeModal?.classList.add("hidden");
});

modeModalButton?.addEventListener('click', (event) => {
    event.stopPropagation();
    modeModal?.classList.remove("hidden");
});


document.addEventListener("keydown", handleKeyPress);

document.getElementById('daily-mode-btn')?.addEventListener('click', () => startGame('daily'));
document.getElementById('timed-mode-btn')?.addEventListener('click', () => startGame('timed'));
document.getElementById('random-mode-btn')?.addEventListener('click', () => startGame('random'));
if (headerLink) {
    headerLink.textContent = `LetrAZ ${modoDeJogo}`;
}

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
    const currentState = getState().gameState;
    const currentGuess = currentState.guesses[currentState.currentRow] || '';


    if (currentGuess.length === 0) {
        return;
    }

    const newGuess = currentGuess.slice(0, -1);
    updateCurrentGuess(newGuess);

    setCursorPosition(newGuess.length);
}

function letterStrategy(key: string): void {
    const currentState = getState().gameState;
    const pos = currentState.currentCol;

    if (pos >= LETTERS) {
        return; 
    }

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
