
import './style.css';

// Importa o estado central e a função de inicialização
import { state, initializeState, saveState } from './gameState'; // Adicione saveState aqui


// Importa os tipos e constantes
import { LETTERS } from './types';

// Importa os módulos que cuidam do tabuleiro, lógica do jogo e teclado
import * as board from './board';
import { submitGuess, restoreBoard } from './game';
import { createKeyboard } from './keyboard';

// ===================================================================
// ===== INICIALIZAÇÃO DO JOGO =======================================
// ===================================================================

// 1. Prepara o estado: carrega do localStorage ou cria um novo para o dia
initializeState();

// 2. Cria os elementos visuais do tabuleiro e do teclado
board.createBoard(handleboxClick);
createKeyboard(handleKeyPress);

// 3. Restaura o visual do tabuleiro caso haja progresso salvo
restoreBoard();

// 4. Posiciona o cursor visual na posição correta (inicial ou carregada)
board.CurrentBox(state.gameState.currentCol, state.gameState.currentRow);

// 5. Adiciona o "ouvinte" principal para as teclas do teclado físico
document.addEventListener("keydown", handleKeyPress);


// ===================================================================
// ===== FUNÇÕES DE INPUT (HANDLERS) =================================
// ===================================================================

/** Lida com os inputs do teclado físico e virtual. */
function handleKeyPress(event: KeyboardEvent) {
  // Se o jogo acabou, bloqueia qualquer ação.
  if (state.gameState.isGameOver) return;

  const key = event.key.toLowerCase();

  if (key === "enter") {
    submitGuess();
    return;
  }

  if (key === "backspace") {
    // A lógica de apagar é simplificada: sempre apaga a letra anterior ao cursor.
    if (state.gameState.currentCol > 0) {
      state.gameState.currentCol--;
      board.updateBox("", state.gameState.currentRow, state.gameState.currentCol);
      
      // ADICIONE ESTA LINHA: Salva após apagar
      saveState();
    }
  } else if (key === "arrowleft") {
    if (state.gameState.currentCol > 0) {
      state.gameState.currentCol--;
    }
  } else if (key === "arrowright") {
    // Permite mover o cursor até a última caixa, mas não além.
    if (state.gameState.currentCol < LETTERS -1) {
      state.gameState.currentCol++;
    }
  } else if (/^[a-z]$/.test(key) && state.gameState.currentCol < LETTERS) {
    // Digita a letra e avança o cursor.
    board.updateBox(key, state.gameState.currentRow, state.gameState.currentCol);
    state.gameState.currentCol++;
    
    // ADICIONE ESTA LINHA: Salva após digitar uma letra
    saveState();
  }
  
  // Atualiza a posição do cursor visual após qualquer movimento.
  board.CurrentBox(state.gameState.currentCol, state.gameState.currentRow);
}

/** Lida com o clique do mouse em uma das caixas do tabuleiro. */
function handleboxClick(row: number, col: number) {
  // Se o jogo acabou ou o clique não for na linha atual, bloqueia a ação.
  if (state.gameState.isGameOver || row !== state.gameState.currentRow) return;

  // Atualiza a posição da coluna e o cursor visual.
  state.gameState.currentCol = col;
  board.CurrentBox(state.gameState.currentCol, state.gameState.currentRow);
}