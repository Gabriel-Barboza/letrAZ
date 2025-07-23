import { palavraCerta, tentativasValidasFiltradas, respostasFiltradas } from "./words";
import { state, saveState } from "./gameState";
import * as board from "./board";
import { PLAYS, LETTERS } from "./types";

const menssagem = document.getElementById("message")!;
let messageTimer: number;

/** Mostra uma mensagem temporária para o usuário (ex: "Palavra inválida!"). */
function showMessage(msg: string, duration: number = 2000) {
    menssagem.textContent = msg;
    menssagem.style.opacity = '1';

    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
        menssagem.style.opacity = '0';
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
        box.classList.remove("box-active"); // Importante: remove o estado ativo

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
        showMessage("Digite 5 letras.");
        return;
    }

    if (!tentativasValidasFiltradas.includes(guess) && !respostasFiltradas.includes(guess)) {
        showMessage("Palavra inválida!");
        return;
    }

    // Atualiza o estado com a tentativa
    state.gameState.guesses[state.gameState.currentRow] = guess;
    colorizeGuess(guess, state.gameState.currentRow);

    // VITÓRIA
    if (guess === palavraCerta) {
        showMessage("Parabéns, você acertou!");
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
    // Para cada palpite salvo no estado...
    state.gameState.guesses.forEach((guess, rowIndex) => {
        // ...preenche as letras na linha correspondente
        for (let i = 0; i < LETTERS; i++) {
            board.updateBox(guess[i] || "", rowIndex, i);
        }
        // ...e aplica as cores corretas
        colorizeGuess(guess, rowIndex);
    });

    // ADICIONE: Restaura as letras da linha atual (em progresso)
    if (!state.gameState.isGameOver && state.gameState.currentRow < PLAYS) {
        const currentRowElement = document.querySelector(`.row-${state.gameState.currentRow}`);
        if (currentRowElement) {
            for (let i = 0; i < LETTERS; i++) {
                const box = currentRowElement.children[i] as HTMLElement;
                const letter = box.textContent || '';
                if (letter) {
                    board.updateBox(letter, state.gameState.currentRow, i);
                }
            }
        }
    }

    // Se o jogo já terminou ao carregar, esconde o cursor
    if (state.gameState.isGameOver) {
        document.querySelector('.cursor')?.classList.remove('cursor');
    }
}