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

  board.colorizeRow(result, row);
    
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
        showMessage("Palavra invalida.", 'error');
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
        showMessage(`Fim de jogo! A palavra era: ${palavraCerta}` , 'error');
        state.gameState.isGameOver = true;
        state.gameState.isComplete = true;
        updateAndSaveStats(false); // Salva o estado final

       
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
        if (state.stats.currentStreak > state.stats.maxStreak) {
            state.stats.maxStreak = state.stats.currentStreak;
        }
    } else {
        state.stats.currentStreak = 0;
    }
    saveState(); // Salva o estado completo, incluindo as estatísticas
}

/** Restaura o visual do tabuleiro com base no estado carregado. */
export function restoreBoard() {
    // Para cada palpite salvo no estado...
    state.gameState.guesses.forEach((guess, rowIndex) => {
        if (!guess) return; // Pula se o palpite for nulo/vazio
        
        // ...preenche as letras na linha correspondente
        for (let i = 0; i < guess.length; i++) {
            board.updateBox(guess[i] || "", rowIndex, i);
        }

        // ✅ CORREÇÃO: Colore apenas as linhas que já foram jogadas (não a linha atual)
        // Isso garante que todas as tentativas anteriores sejam coloridas ao recarregar.
        if (rowIndex < state.gameState.currentRow || state.gameState.isComplete) {
            colorizeGuess(guess, rowIndex);
        }
    });
    
    // ATUALIZA o estilo de todas as linhas com base no estado carregado
    board.atualizarEstilosDasLinhas(state.gameState.currentRow);

    // Se o jogo já terminou ao carregar, esconde o cursor
    if (state.gameState.isGameOver) {
        document.querySelector('.cursor')?.classList.remove('cursor');
    }
}
