import "./components/style.css";
import {
    initializeState,
    getActiveGameState,
    getState,
    updateCurrentGuess,
    moveCursorLeft,
    moveCursorRight,
    setCursorPosition,
    setActiveGameMode,
    resetGameStateForNewGame,
    resetRushStats,
    advanceRushWordIndex,
    finalizeRushWordStats,
    saveState,
    resetRushBoard,
    setGameOver,
    advanceToNextRow,
    setInteractionPaused,
} from "./game/gameState";
import { initializeBoard } from "./components/board";
import {
    createKeyboard,
    updateKeyboardAppearance,
} from "./components/keyboard";
import { submitGuess, calculateRushModeScore } from "./game/game";
import { showMessage } from "./components/toast";
import { LETTERS, PLAYS, type GameModeType } from "./types";
import {
    getDailyWord,
    selectRandomWord,
    setPalavraCerta,
    palavraCerta,
} from "./game/words";
import { EventBus } from "./eventBus";

let rushTimerId: number | null = null;

function stopRushTimer() {
    if (rushTimerId) {
        clearInterval(rushTimerId);
        rushTimerId = null;
    }
}

function advanceToNextRushWord() {
    stopRushTimer();
    const rushState = getState().modes.timed;
    const wordIndex = rushState.gameState.currentWordIndex || 0;

    const setupNextWord = () => {
        advanceRushWordIndex();
        const newWord = selectRandomWord();
        setPalavraCerta(newWord);
        resetRushBoard();
        startRushTimer();
        updateKeyboardAppearance();
        const updatedWordIndex =
            getState().modes.timed.gameState.currentWordIndex || 0;
        const wordCountUI = document.getElementById(
            "rush-word-count"
        ) as HTMLElement;
        if (wordCountUI) {
            wordCountUI.textContent = (updatedWordIndex + 1).toString();
        }
    };

    if (wordIndex >= 9) {
        getActiveGameState().isGameOver = true;
        if (rushState.stats.score > rushState.stats.maxScore) {
            rushState.stats.maxScore = rushState.stats.score;
        }
        saveState();
        showMessage(
            `Fim de Jogo! Pontuação Final: ${rushState.stats.score}`,
            "success",
            5000
        );

        const startBtn = document.getElementById("rush-start-btn") as HTMLElement;
        if (startBtn) {
            startBtn.textContent = "Jogar Novamente";
            startBtn.classList.remove("hidden");
        }
        return;
    }

    setTimeout(setupNextWord, 1000);
}

function startRushTimer() {
    stopRushTimer();
    const timerSpan = document.getElementById("rush-timer") as HTMLElement;
    const rushState = getActiveGameState();
    rushState.timeLeft = 15;
    if (timerSpan) timerSpan.textContent = rushState.timeLeft.toString();
    rushTimerId = setInterval(() => {
        if (rushState.timeLeft && rushState.timeLeft > 0) {
            rushState.timeLeft--;
            if (timerSpan) timerSpan.textContent = rushState.timeLeft.toString();
        } else {
            showMessage("O tempo acabou!", "error");
            advanceToNextRushWord();
        }
    }, 1000);
}

function updateTheme(mode: GameModeType) {
    const body = document.body;
    body.classList.remove("theme-daily", "theme-random", "theme-timed");
    if (mode === "daily") body.classList.add("theme-daily");
    else if (mode === "random") body.classList.add("theme-random");
    else if (mode === "timed") body.classList.add("theme-timed");
}

function updateHeader(mode: GameModeType) {
    const headerLink = document.getElementById("headerLink");
    if (headerLink) {
        if (mode === "daily") headerLink.textContent = "LetrAZ Diário";
        else if (mode === "random") headerLink.textContent = "LetrAZ Livre";
        else if (mode === "timed") headerLink.textContent = "LetrAZ Rush";
    }
}

function startGame(mode: GameModeType) {
    const rushUI = document.getElementById("rush-mode-ui");
    const startBtn = document.getElementById("rush-start-btn");
    const boardContainer = document.getElementById("container-tabuleiro");

    document.getElementById("play-again-btn")?.classList.add("hidden");

    stopRushTimer();

    setActiveGameMode(mode);
    updateHeader(mode);
    updateTheme(mode);

    if (mode === "timed") {
        resetRushStats();
        (document.getElementById("rush-score") as HTMLElement).textContent = "0";
        (document.getElementById("rush-word-count") as HTMLElement).textContent =
            "1";
        (document.getElementById("rush-timer") as HTMLElement).textContent = "15";
    }

    const word = mode === "daily" ? getDailyWord() : selectRandomWord();
    setPalavraCerta(word);

    if (mode !== "daily") {
        resetGameStateForNewGame();
    } else {
        EventBus.emit("stateChanged");
        EventBus.emit("guessSubmitted");
    }

    updateKeyboardAppearance();

    if (mode === "timed") {
        rushUI?.classList.remove("hidden");
        startBtn?.classList.remove("hidden");
        startBtn!.textContent = "Iniciar Rush";

        boardContainer?.classList.add("board-paused");
        setInteractionPaused(true);
    } else {
        rushUI?.classList.add("hidden");
        setInteractionPaused(false);
        boardContainer?.classList.remove("board-paused");
    }

    EventBus.emit("stateChanged");
    setTimeout(updateKeyboardAppearance, 0);
}

function updateStatsModal() {
    const state = getState();
    const dailyStats = state.modes.daily.stats;
    const randomStats = state.modes.random.stats;
    const timedStats = state.modes.timed.stats;
    (document.getElementById("daily-games") as HTMLElement).textContent =
        dailyStats.gamesPlayed.toString();
    const winPercentage =
        dailyStats.gamesPlayed > 0
            ? Math.round((dailyStats.wins / dailyStats.gamesPlayed) * 100)
            : 0;
    (
        document.getElementById("daily-wins") as HTMLElement
    ).textContent = `${winPercentage}%`;
    (document.getElementById("daily-streak") as HTMLElement).textContent =
        dailyStats.currentStreak.toString();
    (document.getElementById("daily-max-streak") as HTMLElement).textContent =
        dailyStats.maxStreak.toString();
    (document.getElementById("random-games") as HTMLElement).textContent =
        randomStats.gamesPlayed.toString();
    (document.getElementById("random-wins") as HTMLElement).textContent =
        randomStats.wins.toString();
    (document.getElementById("random-streak") as HTMLElement).textContent =
        randomStats.currentStreak.toString();
    (document.getElementById("random-max-streak") as HTMLElement).textContent =
        randomStats.maxStreak.toString();

    (document.getElementById("timed-games") as HTMLElement).textContent =
        timedStats.gamesPlayed.toString();
    (document.getElementById("timed-wins") as HTMLElement).textContent =
        timedStats.wins.toString();
    (document.getElementById("timed-last-score") as HTMLElement).textContent =
        timedStats.score.toString();
    (document.getElementById("timed-max-score") as HTMLElement).textContent =
        timedStats.maxScore.toString();
}

function handleboxClick(row: number, col: number) {
    if (getActiveGameState().isInteractionPaused) return;
    const currentState = getActiveGameState();
    if (currentState.isGameOver || row !== currentState.currentRow) return;
    setCursorPosition(col);
}

function letterStrategy(key: string) {
    const currentState = getActiveGameState();
    const pos = currentState.currentCol;
    if (pos >= LETTERS) return;
    let currentGuess = currentState.guesses[currentState.currentRow] || "";
    const letter = key.toUpperCase();
    if (currentGuess.length < pos) {
        currentGuess = currentGuess.padEnd(pos, " ");
    }
    const newGuess =
        currentGuess.slice(0, pos) + letter + currentGuess.slice(pos + 1);
    updateCurrentGuess(newGuess.slice(0, LETTERS));
    moveCursorRight();
}

function backspaceStrategy() {
    const currentState = getActiveGameState();
    const pos = currentState.currentCol;
    if (pos === 0) return;
    const currentGuess = currentState.guesses[currentState.currentRow] || "";
    const paddedGuess = currentGuess.padEnd(LETTERS, " ");
    if (pos < LETTERS && paddedGuess.charAt(pos) !== " ") {
        const newGuess =
            paddedGuess.slice(0, pos) + " " + paddedGuess.slice(pos + 1);
        updateCurrentGuess(newGuess.trimEnd());
        setCursorPosition(pos);
        return;
    }
    if (pos > 0) {
        const newGuess =
            paddedGuess.slice(0, pos - 1) + " " + paddedGuess.slice(pos);
        updateCurrentGuess(newGuess.trimEnd());
        moveCursorLeft();
    }
}
function enterStrategy(): void {
    const activeGameStateBeforeSubmit = getActiveGameState();
    const guess =
        activeGameStateBeforeSubmit.guesses[activeGameStateBeforeSubmit.currentRow];
    const isLastTry = activeGameStateBeforeSubmit.currentRow >= PLAYS - 1;

    const result = submitGuess();
    if (!result.isValid) {
        if (result.message) showMessage(result.message, "error");
        return;
    }

    const didWin = result.isWin;
    const currentState = getState();

    if (currentState.activeMode === "timed") {
        const score = calculateRushModeScore(
            guess,
            palavraCerta,
            activeGameStateBeforeSubmit.currentRow,
            activeGameStateBeforeSubmit.timeLeft || 0
        );
        finalizeRushWordStats(score, didWin);

        const scoreUI = document.getElementById("rush-score") as HTMLElement;
        if (scoreUI)
            scoreUI.textContent = currentState.modes.timed.stats.score.toString();

        if (didWin || isLastTry) {
            advanceToNextRushWord();
        }
    } else {
        if (didWin) {
            setGameOver(true);
            showMessage("Parabéns, você acertou!", "success", 4000);
            if (currentState.activeMode === "random") {
                document.getElementById("play-again-btn")?.classList.remove("hidden");
            }

            return;
        }
        if (isLastTry) {
            setGameOver(false);
            showMessage(`Fim de jogo! A palavra era: ${palavraCerta}`, "error", 4000);
            if (currentState.activeMode === "random") {
                document.getElementById("play-again-btn")?.classList.remove("hidden");
            }
        }
    }

    advanceToNextRow();
}

const keyStrategies: Record<string, () => void> = {
    enter: enterStrategy,
    backspace: backspaceStrategy,
    arrowleft: moveCursorLeft,
    arrowright: moveCursorRight,
};

function handleKeyPress(key: string, event?: KeyboardEvent) {
    if (getActiveGameState().isInteractionPaused) return;
    if (getActiveGameState().isGameOver) return;

    if (key === "enter" && event) {
        event.preventDefault();
    }

    const strategy = keyStrategies[key];
    if (strategy) {
        strategy();
        return;
    }

    if (/^[a-z]$/.test(key)) {
        letterStrategy(key);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    initializeState();
    startGame("daily");

    initializeBoard(handleboxClick);
    createKeyboard(handleKeyPress);

    const modeModal = document.getElementById("modeModal");
    const modeModalButton = document.getElementById("modeModalButton");
    const helpCloseButton = modeModal?.querySelector(".close-button");
    const statsModal = document.getElementById("stats-modal");
    const statsModalButton = document.getElementById("statsModalButton");
    const statsCloseButton = document.getElementById("stats-close-button");

    document.getElementById("rush-start-btn")?.addEventListener("click", () => {
        const startBtn = document.getElementById("rush-start-btn");
        startBtn?.classList.add("hidden");

        setInteractionPaused(false);
        document
            .getElementById("container-tabuleiro")
            ?.classList.remove("board-paused");
        startRushTimer();
    });
    modeModalButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        modeModal?.classList.remove("hidden");
    });
    modeModal?.classList.remove("hidden");
    helpCloseButton?.addEventListener("click", () => {
        modeModal?.classList.add("hidden");
    });
    statsModalButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        updateStatsModal();
        statsModal?.classList.remove("hidden");
    });
    statsCloseButton?.addEventListener("click", () => {
        statsModal?.classList.add("hidden");
    });
    document.addEventListener("click", () => {
        modeModal?.classList.add("hidden");
        statsModal?.classList.add("hidden");
    });

    document.addEventListener("keydown", (event: KeyboardEvent) => {
        handleKeyPress(event.key.toLowerCase(), event);
    });
    document
        .getElementById("daily-mode-btn")
        ?.addEventListener("click", () => startGame("daily"));
    document
        .getElementById("timed-mode-btn")
        ?.addEventListener("click", () => startGame("timed"));
    document
        .getElementById("random-mode-btn")
        ?.addEventListener("click", () => startGame("random"));
    document
        .getElementById("play-again-btn")
        ?.addEventListener("click", () => startGame("random"));

    EventBus.emit("initialStateLoaded");
});
