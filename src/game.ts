import { palavraCerta, tentativasValidasFiltradas, respostasFiltradas } from "./words";
import { state, saveState } from "./gameState";
import * as board from "./board";
import { PLAYS, LETTERS } from "./types";

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
    const target = palavraCerta.split("");
    const result: ("correct" | "present" | "absent")[] = Array(LETTERS).fill("absent");

    // Lógica de coloração (Passo 1: Corretos, Passo 2: Presentes)
    for (let i = 0; i < LETTERS; i++) {
        if (guess[i] === target[i]) {
            result[i] = "correct";
            target[i] = "";
        }
    }
    for (let i = 0; i < LETTERS; i++) {
        if (result[i] === "correct") continue;
        const idx = target.indexOf(guess[i]);
        if (idx !== -1) {
            result[i] = "present";
            target[idx] = "";
        }
    }

    // Aplica as cores na linha do tabuleiro
    const rowEl = document.querySelector(`.row-${row}`)!;
    for (let i = 0; i < LETTERS; i++) {
        const box = rowEl.children[i] as HTMLElement;
        box.classList.remove("box-active", "box-inactive"); // Importante: remove o estado ativo

        if (result[i] === "correct") {
            box.classList.add("bg-green-500", "text-white", "border-none");
        } else if (result[i] === "present") {
            box.classList.add("bg-yellow-500", "text-white", "border-none");
        } else {
            box.classList.add("bg-gray-700", "text-white", "border-none");
        }
    }
}

/** Função principal chamada quando o jogador aperta Enter. */
export function submitGuess() {
    const guess = state.gameState.guesses[state.gameState.currentRow] ||
        Array.from(document.querySelector(`.row-${state.gameState.currentRow}`)!.children)
            .map(box => box.textContent || '')
            .join('');

    if (guess.length < LETTERS) {
        showMessage("Digite 5 letras.", 'error');
        return;
    }

    if (!tentativasValidasFiltradas.includes(guess) && !respostasFiltradas.includes(guess)) {
        showMessage("Palavra Invalida!", 'error'); 
        return;
    }

    // Atualiza o estado com a tentativa
    state.gameState.guesses[state.gameState.currentRow] = guess;
    colorizeGuess(guess, state.gameState.currentRow);

    // VITÓRIA
    if (guess === palavraCerta) {
        showMessage("Parabéns, você acertou!", 'success'); 
        state.gameState.isGameOver = true;
        state.gameState.isComplete = true;
        updateAndSaveStats(true);
        document.querySelector(".cursor")?.classList.remove("cursor");
        return;
    }

    // Se não ganhou, passa para a próxima linha
    state.gameState.currentRow++;
    state.gameState.currentCol = 0;

    // DERROTA (acabaram as tentativas)
    if (state.gameState.currentRow >= PLAYS) {
        showMessage(`Fim de jogo! A palavra era: ${palavraCerta}`);
        state.gameState.isGameOver = true;
        state.gameState.isComplete = true;
        updateAndSaveStats(false);
        document.querySelector(".cursor")?.classList.remove("cursor");
        return;
    }

    // Se o jogo continua, salva o progresso e prepara a próxima linha
    saveState();
    board.CurrentBox(state.gameState.currentCol, state.gameState.currentRow);
    board.atualizarEstilosDasLinhas(state.gameState.currentRow); // Atualiza o estilo da nova linha
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
        const linha = document.querySelector(`.row-${i}`) as HTMLElement;

        // CASO 1: Existe um palpite salvo para esta linha.
        // Isso significa que a linha foi JOGADA e deve ser colorida.
        if (guess) {
            // Coloca as letras de volta...
            for (let j = 0; j < LETTERS; j++) {
                board.updateBox(guess[j] || '', i, j);
            }
            // ...e aplica as cores corretas do resultado (verde, amarelo, etc.).
            colorizeGuess(guess, i);
        }
        // CASO 2: NÃO existe palpite, e esta é a linha ativa (jogo em progresso).
        else if (i === state.gameState.currentRow && !state.gameState.isGameOver) {
            for (let j = 0; j < LETTERS; j++) {
                const bloco = linha.children[j] as HTMLElement;
                bloco.className = 'box box-active';
            }
        }
        // CASO 3: Todas as outras (linhas futuras, ou linhas vazias após o fim do jogo).
        else {
            for (let j = 0; j < LETTERS; j++) {
                const bloco = linha.children[j] as HTMLElement;
                bloco.className = 'box box-inactive';
            }
        }
    }

    // Por fim, cuida da visibilidade e posição do cursor
    if (state.gameState.isGameOver) {
        // Se o jogo acabou, garante que o cursor seja removido.
        document.querySelector('.cursor')?.classList.remove('cursor');
    } else {
        // Se o jogo continua, posiciona o cursor corretamente.
        board.CurrentBox(state.gameState.currentCol, state.gameState.currentRow);
    }
}