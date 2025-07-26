import './style.css';

// ===================================================================
// ===== PONTO DE ENTRADA DA APLICAÇÃO (MAIN) ========================
// ===================================================================
// Responsável por orquestrar a inicialização do jogo e conectar
// os diferentes módulos (estado, UI, lógica).

// Core
import { state, initializeState, saveState } from './core/state';
import { palavraCerta } from './core/word-service';
import * as gameLogic from './core/game-logic';

// Components
import * as board from './components/board';
import * as keyboard from './components/keyboard';
import * as toast from './components/toast';

// Config
import { LETTERS } from './config';

// --- INICIALIZAÇÃO ---
initializeState();

board.createBoard(handleBoxClick);
keyboard.createKeyboard(handleVirtualKeyPress);

restoreGame();

// --- HANDLERS DE INPUT ---

/** Lida com cliques nas caixas do tabuleiro. */
function handleBoxClick(row: number, col: number) {
    if (state.gameState.isGameOver || row !== state.gameState.currentRow) return;
    state.gameState.currentCol = col;
    board.updateCursorPosition(state.gameState.currentRow, state.gameState.currentCol);
}

/** Lida com cliques no teclado virtual. */
function handleVirtualKeyPress(key: string) {
    handleKeyPress(key);
}

/** Lida com o teclado físico. */
document.addEventListener("keydown", (event: KeyboardEvent) => {
    handleKeyPress(event.key);
});

/**
 * Processa uma tecla pressionada (física ou virtual).
 * Esta é a função central que reage ao input do usuário.
 */
function handleKeyPress(key: string) {
    if (state.gameState.isGameOver) return;

    const currentGuess = state.gameState.guesses[state.gameState.currentRow] || '';

    if (key.toLowerCase() === "enter") {
        submitGuess();
        return;
    }

    if (key.toLowerCase() === "backspace") {
        if (state.gameState.currentCol > 0) {
            state.gameState.currentCol--;
            const newGuess = currentGuess.slice(0, -1);
            state.gameState.guesses[state.gameState.currentRow] = newGuess;
            board.updateBox('', state.gameState.currentRow, state.gameState.currentCol);
            saveState();
        }
    } else if (/^[a-z]$/.test(key.toLowerCase()) && state.gameState.currentCol < LETTERS) {
        const newGuess = currentGuess + key.toLowerCase();
        state.gameState.guesses[state.gameState.currentRow] = newGuess;
        board.updateBox(key, state.gameState.currentRow, state.gameState.currentCol);
        state.gameState.currentCol++;
        saveState();
    }

    board.updateCursorPosition(state.gameState.currentRow, state.gameState.currentCol);
}

// --- LÓGICA DE SUBMISSÃO E RESTAURAÇÃO ---

/** Submete a tentativa atual para verificação. */
// Arquivo: main.ts

function submitGuess() {
    const guess = state.gameState.guesses[state.gameState.currentRow] || '';
    const validation = gameLogic.validateGuess(guess);

    if (!validation.isValid) {
        toast.showMessage(validation.message!, 1500, 'error');
        return;
    }

    // 1. Guarda a linha que foi jogada.
    const playedRow = state.gameState.currentRow;

    // 2. Processa a lógica do jogo e atualiza o estado PRIMEIRO.
    const result = gameLogic.processGuess(guess);
    const statuses = gameLogic.checkGuess(guess);

    // 3. AGORA, com o estado finalizado, atualiza a parte visual.
    board.colorizeRow(statuses, playedRow); // Colore a linha que foi jogada.
    statuses.forEach((status, index) => {
        keyboard.updateKeyStatus(guess[index], status);
    });

    // 4. Exibe o resultado da jogada.
    if (result.outcome === 'win') {
        toast.showMessage('Parabéns, você acertou!', 3000, 'success');
    } else if (result.outcome === 'loss') {
        toast.showMessage(`Fim de jogo! A palavra era: ${palavraCerta}`, 5000, 'error');
    } else {
        // Se o jogo continua, prepara a PRÓXIMA linha.
        board.updateRowStyles(state.gameState.currentRow);
        board.updateCursorPosition(state.gameState.currentRow, state.gameState.currentCol);
    }
}

/** Restaura o estado visual do jogo a partir dos dados salvos. */
function restoreGame() {
    // Restaura as linhas que já foram jogadas
    state.gameState.guesses.forEach((guess, row) => {
        // Preenche as letras da tentativa
        for (let col = 0; col < guess.length; col++) {
            board.updateBox(guess[col], row, col);
        }
        // Calcula os status e colore a linha e o teclado
        const statuses = gameLogic.checkGuess(guess);
        board.colorizeRow(statuses, row);
        statuses.forEach((status, index) => {
            keyboard.updateKeyStatus(guess[index], status);
        });
    });

    // Se o jogo não terminou, prepara a próxima linha para ser a ativa
    if (!state.gameState.isGameOver) {
        board.updateRowStyles(state.gameState.currentRow);
        board.updateCursorPosition(state.gameState.currentRow, state.gameState.currentCol);
    }
}

