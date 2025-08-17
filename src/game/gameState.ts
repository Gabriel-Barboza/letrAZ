// src/game/gameState.ts

import { LETTERS, PLAYS } from '../types';
import type { SaveData, CurrentGameState, GameMode } from '../types';
import { EventBus } from '../eventBus' // Certifique-se de que este import está correto

let state: SaveData;

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function createInitialState(): SaveData {
  const statsPadrao = { gamesPlayed: 0, wins: 0, currentStreak: 0, maxStreak: 0, winDistribution: {} };
  return {
    stats: { ...statsPadrao },
    timedModeStats: { ...statsPadrao, score: 0, timeTaken: 0, hintsUsed: 0, maxScore: 0 },
    randomModeStats: { ...statsPadrao },
    gameMode: { gameType: 'daily' },
    gameState: {
      guesses: Array(PLAYS).fill(''),
      currentRow: 0,
      currentCol: 0,
      isGameOver: false,
      isComplete: false,
      date: getTodayDateString(),
    }
  };
}

export function getState(): SaveData {
  return state;
}

function saveState() {
  localStorage.setItem('gameData', JSON.stringify(state));
}

export function setActiveGameMode(mode: GameMode['gameType']) {
    state.gameMode.gameType = mode;
}

export function resetGameStateForNewGame() {
    const initialState = createInitialState();
    state.gameState = initialState.gameState;
    // MUDANÇA: Substitui notify()
    
    EventBus.emit('stateChanged'); 
    // ADICIONE A LINHA ABAIXO:
    EventBus.emit('guessSubmitted');
}

export function setGameOver(didWin: boolean) {
    state.gameState.isGameOver = true;
    state.gameState.isComplete = true;

    let activeStats;
    switch (state.gameMode.gameType) {
        case 'timed':
            activeStats = state.timedModeStats;
            break;
        case 'random':
            activeStats = state.randomModeStats;
            break;
        case 'daily':
        default:
            activeStats = state.stats;
            break;
    }

    activeStats.gamesPlayed++;
    if (didWin) {
        activeStats.wins++;
        activeStats.currentStreak++;
        if (activeStats.currentStreak > activeStats.maxStreak) {
            activeStats.maxStreak = activeStats.currentStreak;
        }
        const winRow = state.gameState.currentRow + 1;
        activeStats.winDistribution[winRow] = (activeStats.winDistribution[winRow] || 0) + 1;
    } else {
        activeStats.currentStreak = 0;
    }
    
    saveState();
    // MUDANÇA: Substitui notify() por eventos específicos
    EventBus.emit('stateChanged');
    EventBus.emit('guessSubmitted');
}

export function updateCurrentGuess(guess: string) {
    state.gameState.guesses[state.gameState.currentRow] = guess;
    // MUDANÇA: Substitui notify()
    EventBus.emit('stateChanged');
}

export function advanceToNextRow() {
    state.gameState.currentRow++;
    state.gameState.currentCol = 0;
    saveState();
    // MUDANÇA: Substitui notify() por eventos específicos
    EventBus.emit('stateChanged');
    EventBus.emit('guessSubmitted');
}

export function moveCursorLeft() {
    if (state.gameState.currentCol > 0) {
        state.gameState.currentCol--;
        // MUDANÇA: Substitui notify()
        EventBus.emit('stateChanged');
    }
}

export function moveCursorRight() {
    if (state.gameState.currentCol < LETTERS) {
        state.gameState.currentCol++;
        // MUDANÇA: Substitui notify()
        EventBus.emit('stateChanged');
    }
}

export function setCursorPosition(col: number) {
    if (col >= 0 && col <= LETTERS) {
        state.gameState.currentCol = col;
        // MUDANÇA: Substitui notify()
        EventBus.emit('stateChanged');
    }
}

export function initializeState() {
    const savedDataString = localStorage.getItem('gameData');
    if (savedDataString) {
        const savedData: Partial<SaveData> = JSON.parse(savedDataString);
        const initialState = createInitialState();
        state = {
            ...initialState,
            ...savedData,
            stats: { ...initialState.stats, ...savedData.stats },
            timedModeStats: { ...initialState.timedModeStats, ...savedData.timedModeStats },
            randomModeStats: { ...initialState.randomModeStats, ...savedData.randomModeStats },
        };
        if (state.gameMode.gameType === 'daily') {
            const today = getTodayDateString();
            if (state.gameState.date !== today) {
                state.gameState = initialState.gameState;
            }
        }
    } else {
        state = createInitialState();
    }
    saveState();
}