
import { LETTERS, PLAYS } from "../types";
import type {
    SaveData,
    CurrentGameState,
    GameModeType,
    GameStats,
    RandomModeStats,
    timedModeStats,
} from "../types";
import { EventBus } from "../eventBus";
let state: SaveData;
function getTodayDateString(): string {
    return new Date().toISOString().split("T")[0];
}
function createInitialState(): SaveData {
    const createCleanGameState = (
        includeDate: boolean = false
    ): CurrentGameState => {
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
        gamesPlayed: 0,
        wins: 0,
        currentStreak: 0,
        maxStreak: 0,
        winDistribution: {},
    });
    return {
        activeMode: "daily",
        modes: {
            daily: {
                stats: createCleanStats(),
                gameState: createCleanGameState(true),
            },
            random: {
                stats: createCleanStats() as RandomModeStats,
                gameState: createCleanGameState(false),
            },
            timed: {
                stats: {
                    ...createCleanStats(),
                    score: 0,
                    timeTaken: 0,
                    hintsUsed: 0,
                    maxScore: 0,
                    lastScore: 0,
                } as timedModeStats,
                gameState: createCleanGameState(false),
            },
        },
    };
}
export function saveState() {
    const stateToSave = JSON.parse(JSON.stringify(state));
    stateToSave.modes.random.gameState =
        createInitialState().modes.random.gameState;
    stateToSave.modes.timed.gameState =
        createInitialState().modes.timed.gameState;
    localStorage.setItem("gameData", JSON.stringify(stateToSave));
}
export function setInteractionPaused(isPaused: boolean) {
    getActiveGameState().isInteractionPaused = isPaused;
    EventBus.emit("stateChanged");
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
            console.error(
                "Erro ao carregar dados salvos. Começando um novo jogo.",
                error
            );
            localStorage.removeItem("gameData");
            state = createInitialState();
        }
    }

    const today = getTodayDateString();
    const savedDate = state.modes.daily.gameState.date;

    console.log(" DEBUG ATUALIZAÇÃO DE DATA:");
    console.log("Data de hoje:", today);
    console.log("Data salva antes:", savedDate);

    if (!savedDate || savedDate !== today) {
        console.log(" NOVO DIA DETECTADO - ATUALIZANDO...");
        const currentStats = state.modes.daily.stats;
        state.modes.daily = createInitialState().modes.daily;
        state.modes.daily.stats = currentStats;
        state.modes.daily.gameState.date = today;
        EventBus.emit("stateChanged");
        EventBus.emit("guessSubmitted");
        saveState();
        const verificacao = JSON.parse(localStorage.getItem("gameData") || "{}");
        console.log(
            "Data no localStorage após save:",
            verificacao.modes?.daily?.gameState?.date
        );
    } 
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
    const savedDataString = localStorage.getItem("gameData");
    if (savedDataString) {
        try {
            const savedData: Partial<SaveData> = JSON.parse(savedDataString);
            if (savedData.modes?.daily?.gameState) {
                state.modes.daily.gameState = savedData.modes.daily.gameState;
            }
        } catch (error) {
            console.error("Erro ao recarregar estado antes da troca de modo.", error);
        }
    }
    state.activeMode = mode;
    saveState();
}
export function resetGameStateForNewGame() {
    const initialState = createInitialState();
    state.modes[state.activeMode].gameState =
        initialState.modes[state.activeMode].gameState;
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
        if (getState().activeMode === "daily") {
            const winRow = activeGameState.currentRow + 1;
            activeStats.winDistribution[winRow] =
                (activeStats.winDistribution[winRow] || 0) + 1;
        }
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
    if (activeGameState.currentCol < LETTERS-1) {
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

export function resetRushStats() {
    const rushStats = state.modes.timed.stats;
    const rushGameState = state.modes.timed.gameState;

    rushStats.score = 0;
    if (rushGameState) {
        rushGameState.currentWordIndex = 0;
    }

    saveState();
}

export function advanceRushWordIndex() {
    const rushState = state.modes.timed.gameState;
    if (rushState.currentWordIndex !== undefined) {
        console.log(rushState.currentWordIndex);
        rushState.currentWordIndex++;
    }
}

export function finalizeRushWordStats(score: number, didWin: boolean) {
    const rushState = state.modes.timed;
    rushState.stats.score += score;
    if (didWin) {
        rushState.stats.wins++;
    }
}

export function resetRushBoard() {
    const rushState = state.modes.timed.gameState;
    const initialState = createInitialState().modes.timed.gameState;
    rushState.guesses = initialState.guesses;
    rushState.currentRow = initialState.currentRow;
    rushState.currentCol = initialState.currentCol;
    rushState.isGameOver = initialState.isGameOver;
    rushState.isComplete = initialState.isComplete;
    EventBus.emit("stateChanged");
}
