// src/game/gameState.ts

import { LETTERS, PLAYS } from '../types';
import type { SaveData, CurrentGameState } from '../types';

// --- ESTRUTURA E ESTADO ---
export let state: SaveData;
const subscribers: Array<(gameState: CurrentGameState) => void> = [];

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function createInitialState(): SaveData {
  return {
    stats: {
      gamesPlayed: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      winDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    },
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

// --- SISTEMA DE INSCRIÇÃO (SUBSCRIBE/NOTIFY) ---
export function subscribe(callback: (gameState: CurrentGameState) => void) {
  subscribers.push(callback);
}

function notify() {
  const currentState = getState();
  subscribers.forEach(callback => callback(currentState));
}

// --- FUNÇÕES DE LEITURA E PERSISTÊNCIA ---
export function getState(): CurrentGameState {
  return { ...state.gameState };
}

function saveState() {
  localStorage.setItem('gameData', JSON.stringify(state));
}

// --- FUNÇÕES QUE MODIFICAM O ESTADO (MUTATORS) ---
export function updateCurrentGuess(guess: string) {
    state.gameState.guesses[state.gameState.currentRow] = guess;
   
    notify(); // Notifica para que a UI redesenhe as letras na linha ativa
}

export function advanceToNextRow() {
    state.gameState.currentRow++;
    state.gameState.currentCol = 0;
    saveState();
    notify();
}

export function setGameOver(didWin: boolean) {
    state.gameState.isGameOver = true;
    state.gameState.isComplete = true;

    state.stats.gamesPlayed++;
    if (didWin) {
        state.stats.wins++;
        state.stats.currentStreak++;
        if (state.stats.currentStreak > state.stats.maxStreak) {
            state.stats.maxStreak = state.stats.currentStreak;
        }
        const winRow = state.gameState.currentRow + 1;
        state.stats.winDistribution[winRow] = (state.stats.winDistribution[winRow] || 0) + 1;
    } else {
        state.stats.currentStreak = 0;
    }

    saveState();
    notify();
}

export function moveCursorLeft() {
    if (state.gameState.currentCol > 0) {
        state.gameState.currentCol--;
        
        notify();
    }
}

export function moveCursorRight() {
    // A verificação agora é apenas contra o limite do tabuleiro (LETTERS).
    if (state.gameState.currentCol < LETTERS) {
        state.gameState.currentCol++;
        notify();
    }
}

export function setCursorPosition(col: number) {
    // A verificação agora é apenas contra o limite do tabuleiro.
    // O cursor pode estar em qualquer posição de 0 a 5.
    if (col >= 0 && col <= LETTERS) {
        state.gameState.currentCol = col;
        notify();
    }
}

// --- INICIALIZAÇÃO ---
export function initializeState() {
  const savedDataString = localStorage.getItem('gameData');
  
  if (savedDataString) {
    const savedData: SaveData = JSON.parse(savedDataString);
    const today = getTodayDateString();

    if (savedData.gameState.date !== today) {
      state = createInitialState();
      state.stats = savedData.stats;
    } else {
      state = savedData;
    }
  } else {
    state = createInitialState();
  }
  saveState();
}