// src/game/gameState.ts

import { LETTERS, PLAYS } from "../types";
import type { SaveData, CurrentGameState, GameModeType, GameStats, RandomModeStats, timedModeStats } from "../types";
import { EventBus } from "../eventBus";

let state: SaveData;

function getTodayDateString(): string {
    return new Date().toISOString().split("T")[0];
}

function createInitialState(): SaveData {
    const createCleanGameState = (date?: string): CurrentGameState => ({
        guesses: Array(PLAYS).fill(""),
        currentRow: 0,
        currentCol: 0,
        isGameOver: false,
        isComplete: false,
        date: date || getTodayDateString(),
    });

    const createCleanStats = (): GameStats => ({
        gamesPlayed: 0,
        wins: 0,
        currentStreak: 0,
        maxStreak: 0,
        winDistribution: {},
    });

    return {
        activeMode: 'daily',
        modes: {
            daily: {
                stats: createCleanStats(),
                gameState: createCleanGameState(getTodayDateString()),
            },
            random: {
                stats: createCleanStats() as RandomModeStats,
                gameState: createCleanGameState(),
            },
            timed: {
                stats: {
                    ...createCleanStats(),
                    score: 0,
                    timeTaken: 0,
                    hintsUsed: 0,
                    maxScore: 0,
                } as timedModeStats,
                gameState: createCleanGameState(),
            },
        }
    };
}

function saveState() {
    const stateToSave = JSON.parse(JSON.stringify(state));
    const cleanGameState = createInitialState().modes.random.gameState;

    stateToSave.modes.random.gameState = cleanGameState;
    stateToSave.modes.timed.gameState = cleanGameState;
    
    localStorage.setItem("gameData", JSON.stringify(stateToSave));
}

export function getState(): SaveData {
    return state;
}

export function getActiveGameState(): CurrentGameState {
    return state.modes[state.activeMode].gameState;
}

export function getActiveStats() {
    return state.modes[state.activeMode].stats;
}

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
        activeStats.currentStreak++;
        if (activeStats.currentStreak > activeStats.maxStreak) {
            activeStats.maxStreak = activeStats.currentStreak;
        }
        const winRow = activeGameState.currentRow + 1;
        activeStats.winDistribution[winRow] = (activeStats.winDistribution[winRow] || 0) + 1;
    } else {
        activeStats.currentStreak = 0;
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

export function initializeState() {
    const savedDataString = localStorage.getItem("gameData");
    state = createInitialState();

    if (savedDataString) {
        try {
            const savedData: Partial<SaveData> = JSON.parse(savedDataString);
            
            if (savedData.activeMode) {
                state.activeMode = savedData.activeMode;
            }

            if (savedData.modes) {
                if (savedData.modes.daily) {
                    state.modes.daily = savedData.modes.daily;
                }
                if (savedData.modes.random?.stats) {
                    state.modes.random.stats = savedData.modes.random.stats;
                }
                if (savedData.modes.timed?.stats) {
                    state.modes.timed.stats = savedData.modes.timed.stats;
                }
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