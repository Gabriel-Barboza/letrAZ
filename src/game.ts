import { palavraCerta, tentativasValidas } from "./core/word-service";
import { state, saveState } from "./core/state";
import * as board from "./components/board";
import * as gameLogic from "./core/game-logic";
import { PLAYS, LETTERS } from "./config";

const toastContainer = document.createElement('div');
document.body.appendChild(toastContainer);
let messageTimer: number;

function showMessage(msg: string, type: 'success' | 'error' = 'error', duration: number = 2000) {
    // Configura o toast com as classes do seu CSS
    toastContainer.className = 'toast-container'; // Reseta as classes
    toastContainer.classList.add(type); // Adiciona o tipo (success ou error)
    toastContainer.textContent = msg;

    // Torna o toast visível
    toastContainer.classList.add('visible');

    // Limpa o timer anterior para evitar que o toast suma antes da hora
    clearTimeout(messageTimer);

    // Agenda o desaparecimento do toast
    messageTimer = setTimeout(() => {
        toastContainer.classList.remove('visible');
    }, duration);
}
/** Colore a linha da tentativa e o teclado virtual com base no resultado. */
export function colorizeGuess(guess: string, row: number) {
    // Usa a lógica de verificação do gameLogic
    const statuses = gameLogic.checkGuess(guess);
    
    // Aplica as cores no tabuleiro usando a função do board
    board.colorizeRow(statuses, row);

    // Atualiza as cores do teclado
    for (let i = 0; i < LETTERS; i++) {
        const letter = guess[i].toLowerCase();
        const status = statuses[i];
        const keyElement = document.querySelector(`.keyboard-key[data-key="${letter}"]`) as HTMLElement;

        if (keyElement) {
            // Remove classes anteriores
            keyElement.classList.remove('correct', 'present', 'absent');
            
            if (status === 'correct') {
                keyElement.classList.add('correct');
            } else if (status === 'present' && !keyElement.classList.contains('correct')) {
                keyElement.classList.add('present');
            } else if (status === 'absent' && !keyElement.classList.contains('correct') && !keyElement.classList.contains('present')) {
                keyElement.classList.add('absent');
            }
        }
    }
}


/** Função principal chamada quando o jogador aperta Enter. */
export function submitGuess() {
    // 1. Obter a tentativa ATUAL diretamente do DOM.
    const currentRowElement = document.querySelector(`.row-${state.gameState.currentRow}`);
    if (!currentRowElement) return;

    const guess = Array.from(currentRowElement.children)
        .map(box => box.textContent || '')
        .join('')
        .toUpperCase();

    // 2. Validar a tentativa.
    if (guess.length < LETTERS) {
        showMessage("Digite 5 letras.", 'error');
        return;
    }

    if (!tentativasValidas.includes(guess)) {
        showMessage("Palavra inválida!", 'error');
        return;
    }

    // 3. Processar a tentativa válida.
    state.gameState.guesses[state.gameState.currentRow] = guess;
    colorizeGuess(guess, state.gameState.currentRow);

    // 4. Verificar condição de vitória.
    if (guess === palavraCerta) {
        showMessage("Parabéns, você acertou!", 'success');
        state.gameState.isGameOver = true;
        state.gameState.isComplete = true;
        updateAndSaveStats(true);
        document.querySelector(".cursor")?.classList.remove("cursor");
        return;
    }

    // 5. Passar para a próxima linha.
    state.gameState.currentRow++;
    state.gameState.currentCol = 0;

    // 6. Verificar condição de derrota.
    if (state.gameState.currentRow >= PLAYS) {
        showMessage(`Fim de jogo! A palavra era: ${palavraCerta}`);
        state.gameState.isGameOver = true;
        state.gameState.isComplete = true;
        updateAndSaveStats(false);
        document.querySelector(".cursor")?.classList.remove("cursor");
        return;
    }

    // 7. Se o jogo continua, salvar e preparar a próxima linha.
    saveState();
    board.updateRowStyles(state.gameState.currentRow);
    board.updateCursorPosition(state.gameState.currentRow, state.gameState.currentCol);
}

/** Atualiza as estatísticas do jogador e salva o estado. */
function updateAndSaveStats(didWin: boolean) {
    state.stats.gamesPlayed++;
    if (didWin) {
        state.stats.wins++;
        state.stats.currentStreak++;
        state.stats.maxStreak = Math.max(state.stats.maxStreak, state.stats.currentStreak);
        // +1 porque currentRow é base 0 (0-4), e as tentativas são (1-5)
        state.stats.winDistribution[state.gameState.currentRow + 1]++;
    } else {
        state.stats.currentStreak = 0;
    }
    saveState(); // Salva o estado final com as estatísticas atualizadas
}

/** Restaura o visual do tabuleiro com base no estado carregado. */
export function restoreBoard() {
    // Itera sobre cada posição de linha possível no tabuleiro
    for (let i = 0; i < PLAYS; i++) {
        const guess = state.gameState.guesses[i];

        // CASO 1: Existe um palpite salvo para esta linha.
        // Isso significa que a linha foi JOGADA e deve ser colorida.
        if (guess) {
            // Coloca as letras de volta...
            for (let j = 0; j < LETTERS; j++) {
                board.updateBox(guess[j] || '', i, j);
            }
            // ...e aplica as cores corretas do resultado (verde, amarelo, etc.).
            const statuses = gameLogic.checkGuess(guess);
            board.colorizeRow(statuses, i);
        }
    }

    // Atualiza os estilos das linhas (ativa/inativa)
    board.updateRowStyles(state.gameState.currentRow);

    // Por fim, cuida da visibilidade e posição do cursor
    if (state.gameState.isGameOver) {
        // Se o jogo acabou, garante que o cursor seja removido.
        document.querySelector('.cursor')?.classList.remove('cursor');
    } else {
        // Se o jogo continua, posiciona o cursor corretamente.
        board.updateCursorPosition(state.gameState.currentRow, state.gameState.currentCol);
    }
}