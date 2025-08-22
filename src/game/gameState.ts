// src/game/gameState.ts

import { LETTERS, PLAYS } from "../types";
import type { SaveData, CurrentGameState, GameModeType, GameStats, RandomModeStats, timedModeStats } from "../types";
import { EventBus } from "../eventBus";

let state: SaveData;

function getTodayDateString(): string {
    return new Date().toISOString().split("T")[0];
}

function createInitialState(): SaveData {
    const createCleanGameState = (includeDate: boolean = false): CurrentGameState => {
        const gameState: CurrentGameState = {
            guesses: Array(PLAYS).fill(""),
            currentRow: 0,
            currentCol: 0,
            isGameOver: false,
            isComplete: false,
            currentWordIndex: 0,
            timeLeft: 15,
             isInteractionPaused: false,
        };
        if (includeDate) {
            gameState.date = getTodayDateString();
        }
        return gameState;
    };
    const createCleanStats = (): GameStats => ({
        gamesPlayed: 0, wins: 0, currentStreak: 0, maxStreak: 0, winDistribution: {},
    });
    return {
        activeMode: 'daily',
        modes: {
            daily: { stats: createCleanStats(), gameState: createCleanGameState(true) },
            random: { stats: createCleanStats() as RandomModeStats, gameState: createCleanGameState(false) },
            timed: {
                stats: { ...createCleanStats(), score: 0, timeTaken: 0, hintsUsed: 0, maxScore: 0 } as timedModeStats,
                gameState: createCleanGameState(false),
            },
        }
    };
}

export function saveState() {
    const stateToSave = JSON.parse(JSON.stringify(state));
    const cleanGameState = createInitialState().modes.random.gameState;
    stateToSave.modes.random.gameState = cleanGameState;
    stateToSave.modes.timed.gameState = cleanGameState;
    localStorage.setItem("gameData", JSON.stringify(stateToSave));
}
export function setInteractionPaused(isPaused: boolean) {
    getActiveGameState().isInteractionPaused = isPaused;
    EventBus.emit('stateChanged');
}

export function initializeState() {
    const savedDataString = localStorage.getItem("gameData");
    state = createInitialState(); 
    if (savedDataString) {
        try {
            const savedData: Partial<SaveData> = JSON.parse(savedDataString);
            if (savedData.activeMode) state.activeMode = savedData.activeMode;
            if (savedData.modes) {
                state.modes = { ...state.modes, ...savedData.modes };
            }
        } catch (error) {
            console.error("Erro ao carregar dados salvos. Começando um novo jogo.", error);
            localStorage.removeItem("gameData");
            state = createInitialState();
        }
    }
    const today = getTodayDateString();
    if (state.modes.daily.gameState.date !== today) {
        state.modes.daily = createInitialState().modes.daily;
    }
}

export function getState(): SaveData { return state; }
export function getActiveGameState(): CurrentGameState { return state.modes[state.activeMode].gameState; }
export function getActiveStats() { return state.modes[state.activeMode].stats; }

export function setActiveGameMode(mode: GameModeType) {
    state.activeMode = mode;
    saveState();
}

export function resetGameStateForNewGame() {
    const initialState = createInitialState();
    state.modes[state.activeMode].gameState = initialState.modes[state.activeMode].gameState;
    EventBus.emit("stateChanged");
    EventBus.emit("guessSubmitted");
}

export function setGameOver(didWin: boolean) {
    const activeGameState = getActiveGameState();
    const activeStats = getActiveStats();

    activeGameState.isGameOver = true;
    activeGameState.isComplete = true;

    activeStats.gamesPlayed++;
    if (didWin) {
        activeStats.wins++;
        activeStats.currentStreak++; // Incrementa a sequência atual
        if (activeStats.currentStreak > activeStats.maxStreak) {
            activeStats.maxStreak = activeStats.currentStreak; // Atualiza o recorde se necessário
        }
        // A lógica de distribuição de vitórias só se aplica ao modo diário
        if (getState().activeMode === 'daily') {
            const winRow = activeGameState.currentRow + 1;
            activeStats.winDistribution[winRow] = (activeStats.winDistribution[winRow] || 0) + 1;
        }
    } else {
        activeStats.currentStreak = 0; // Zera a sequência se o jogador perder
    }

    saveState();
    EventBus.emit("stateChanged");
    EventBus.emit("guessSubmitted");
}
export function updateCurrentGuess(guess: string) {
    getActiveGameState().guesses[getActiveGameState().currentRow] = guess;
    EventBus.emit("stateChanged");
}

export function advanceToNextRow() {
    const activeGameState = getActiveGameState();
    activeGameState.currentRow++;
    activeGameState.currentCol = 0;
    saveState();
    EventBus.emit("stateChanged");
    EventBus.emit("guessSubmitted");
}

export function moveCursorLeft() {
    const activeGameState = getActiveGameState();
    if (activeGameState.currentCol > 0) {
        activeGameState.currentCol--;
        EventBus.emit("stateChanged");
    }
}

export function moveCursorRight() {
    const activeGameState = getActiveGameState();
    if (activeGameState.currentCol < LETTERS) {
        activeGameState.currentCol++;
        EventBus.emit("stateChanged");
    }
}

export function setCursorPosition(col: number) {
    const activeGameState = getActiveGameState();
    if (col >= 0 && col <= LETTERS) {
        activeGameState.currentCol = col;
        EventBus.emit("stateChanged");
    }
}

// --- Funções Específicas do Modo Rush ---

export function resetRushStats() {
    // Pega apenas as estatísticas do modo rush
    const rushStats = state.modes.timed.stats;
    const rushGameState = state.modes.timed.gameState;

    // Reseta APENAS a pontuação e o contador de palavras da SESSÃO ATUAL
    rushStats.score = 0;
    if (rushGameState) {
        rushGameState.currentWordIndex = 0;
    }
    
    // NÃO mexe em gamesPlayed, wins, ou maxScore.
    
    saveState();
}

export function advanceRushWordIndex() {
    const rushState = state.modes.timed.gameState;
    if (rushState.currentWordIndex !== undefined) {
        rushState.currentWordIndex++;
    }
}

export function finalizeRushWordStats(score: number, didWin: boolean) {
    const rushState = state.modes.timed;
    rushState.stats.score += score;
    if (didWin) {
        rushState.stats.wins++;
    }
    const wordIndex = rushState.gameState.currentWordIndex || 0;
    if (wordIndex >= 9) {
        rushState.stats.gamesPlayed++;
        if (rushState.stats.score > rushState.stats.maxScore) {
            rushState.stats.maxScore = rushState.stats.score;
        }
    }
    saveState();
}

export function resetRushBoard() {
    const rushState = state.modes.timed.gameState;
    const initialState = createInitialState().modes.timed.gameState;
    rushState.guesses = initialState.guesses;
    rushState.currentRow = initialState.currentRow;
    rushState.currentCol = initialState.currentCol;
    rushState.isGameOver = initialState.isGameOver;
    rushState.isComplete = initialState.isComplete;
    EventBus.emit('stateChanged');
}