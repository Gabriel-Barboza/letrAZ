import './style.css'
import { gameState, LETTERS } from './gameState';
import * as board from './board';
import { submitGuess } from './game';

function handleKeyPress(event: KeyboardEvent) {
  if (gameState.isGameOver) return;
  const key = event.key.toLowerCase();
  const previousCol = gameState.currentCol;

  if (key === "enter") {
    submitGuess();
    return;
  }

  if (key === "arrowleft") {
    if (gameState.currentCol > 0) gameState.currentCol--;
  }

  if (key === "arrowright") {
    if (gameState.currentCol < LETTERS - 1) gameState.currentCol++;
  }

  if (key == "backspace") {
    if (gameState.currentCol >= 0) {
      const linhasElement = document.querySelector(`.row-${gameState.currentRow}`)!;
      const caixa = linhasElement.children[gameState.currentCol] as HTMLElement;
      if (caixa.textContent == "" && gameState.currentCol > 0) {
        gameState.currentCol--;
        board.updateBox("", gameState.currentRow, gameState.currentCol);
      }

      board.updateBox("", gameState.currentRow, gameState.currentCol);
      board.CurrentBox(gameState.currentCol, gameState.currentRow);
    }
  }

  if (/^[a-z]$/.test(key) && gameState.currentCol < LETTERS) {
    board.updateBox(key, gameState.currentRow, gameState.currentCol);
    if (gameState.currentCol < LETTERS - 1) {
      gameState.currentCol++;
    }
  }

  if (previousCol !== gameState.currentCol) {
    board.CurrentBox(gameState.currentCol, gameState.currentRow);
  }
}

function handleboxClick(row: number, col: number) {
  if (gameState.isGameOver) return;
  if (row < gameState.currentRow || row > gameState.currentRow) return;
  
  gameState.currentRow = row;
  gameState.currentCol = col;
  board.CurrentBox(gameState.currentCol, gameState.currentRow);
}

// Inicialização
board.createBoard(handleboxClick);
board.CurrentBox(gameState.currentCol, gameState.currentRow);
document.addEventListener("keydown", handleKeyPress);