import * as words from './words';
import { gameState, LETTERS, PLAYS } from './gameState';
import * as board from './board';

export function colorizeGuess(guess: string, row: number) {
  const target = words.palavraCerta.split("");
  const result: ("correct" | "present" | "absent")[] = Array(LETTERS).fill("absent");

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

  const rowEl = document.querySelector(`.row-${row}`)!;
  for (let i = 0; i < LETTERS; i++) {
    const box = rowEl.children[i] as HTMLElement;
    box.classList.remove('box-active');
    box.classList.remove("bg-white", "bg-gray-200");

    if (result[i] === "correct") {
      box.classList.add("bg-green-500", "text-white", "border-none");
    } else if (result[i] === "present") {
      box.classList.add("bg-yellow-500", "text-white", "border-none");
    } else {
      box.classList.add("bg-gray-700", "text-white", "border-none");
    }
  }
}

export function showMessage(msg: string) {
  board.menssagem.textContent = msg;
}

export function submitGuess() {
  const linhasElement = document.querySelector(`.row-${gameState.currentRow}`)!;
  const guess = Array.from(linhasElement.children)
    .map((box) => box.textContent?.toUpperCase() || "")
    .join("");

  if (guess.length < LETTERS) {
    showMessage("Digite 5 letras.");
    return;
  }
  if (!words.tentativasValidasFiltradas.includes(guess) && !words.respostasFiltradas.includes(guess)) {
    showMessage("Palavra inválida!");
    return;
  }
  
  gameState.guesses.push(guess);
  colorizeGuess(guess, gameState.currentRow);
  
  if (guess === words.palavraCerta) {
    showMessage("Parabéns! Você acertou a palavra!");
    gameState.isGameOver = true;
    document.querySelector('.cursor')?.classList.remove('cursor');
    return;
  }
  
  gameState.currentRow++;
  gameState.currentCol = 0;
  board.atualizarEstilosDasLinhas(gameState.currentRow);
  
  if (guess != words.palavraCerta) {
    board.CurrentBox(gameState.currentCol, gameState.currentRow);
  }
  
  if (gameState.currentRow >= PLAYS) {
    showMessage(`Fim de jogo! A palavra era: ${words.palavraCerta.toUpperCase()}`);
    gameState.isGameOver = true;
    document.querySelector('.cursor')?.classList.remove('cursor');
    return;
  }
}