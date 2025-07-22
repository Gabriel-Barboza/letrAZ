import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'
import * as words from './words';

const jogadas = 5
const letrasPorLinha = 5
let currentRow = 0;
let currentCol = 0;
let guesses: string[] = [];
const grid = document.getElementById("tabuleiro")!;
const menssagem = document.getElementById("message")!;

for (let linhas = 0; linhas < jogadas; linhas++) {
  const linhasElement = document.createElement("div");
  linhasElement.className = `grid grid-cols-5 gap-2 row-${linhas}`;

  for (let letras = 0; letras < letrasPorLinha; letras++) {
    const caixa = document.createElement("div");

    if (linhas === 0) {
      // Linha ativa inicial
      caixa.className =
        "box w-15 h-15 border-2 border-gray-800 bg-white text-gray-800 dark:border-gray-400 dark:text-gray-200 rounded-lg flex items-center justify-center text-2xl font-bold";
    } else {
      // Linhas futuras
      caixa.className =
        "box w-15 h-15 ca bg-gray-200 text-gray-400 dark:border-gray-600 dark:text-gray-500 rounded-lg flex items-center justify-center text-2xl font-bold";
    }

    linhasElement.appendChild(caixa);
  }

  grid.appendChild(linhasElement);
}


console.log(words.palavraCerta);
document.addEventListener("keydown", handleKeyPress);

function handleKeyPress(event: KeyboardEvent) {
  const key = event.key.toLowerCase();

  if (key == "enter") {
    submitGuess() // Lógica para quando a tecla Enter é pressionada
  }

  if (key == "backspace") {
    if (currentCol > 0) {
      currentCol--
      updateBox("", currentRow, currentCol);
    } // Lógica para quando a tecla Backspace é pressionada
  }

  if (/^[a-z]$/.test(key) && currentCol < letrasPorLinha) {
    updateBox(key, currentRow, currentCol);
    currentCol++;
  }
}

function updateBox(letter: string, row: number, col: number) {
  const linhasElement = document.querySelector(`.row-${row}`)!;
  const caixa = linhasElement.children[col] as HTMLElement;
  caixa.textContent = letter.toUpperCase();

  // Deixa as caixas das linhas maiores que a linha atual cinzas

}
function atualizarEstilosDasLinhas() {
  for (let i = 0; i < jogadas; i++) {
    const linha = document.querySelector(`.row-${i}`)!;
    for (let j = 0; j < letrasPorLinha; j++) {
      const bloco = linha.children[j] as HTMLElement;

      if (i === currentRow) {
        // Linha atual
        bloco.className =
          "box w-15 h-15 border-2 border-gray-800 bg-white text-gray-800 dark:border-gray-400 dark:text-gray-200 rounded-lg flex items-center justify-center text-2xl font-bold";
      } else if (i > currentRow) {
        // Linhas futuras
        bloco.className =
          "box w-15 h-15   bg-gray-200 text-gray-400 dark:border-gray-600 dark:text-gray-500 rounded-lg flex items-center justify-center text-2xl font-bold";
      } else {
        // Linhas já jogadas — você pode mudar o estilo aqui também se quiser
      }
    }
  }
}

function showMessage(msg: string) {
  menssagem.textContent = msg;
}

function submitGuess() {

  if (currentCol < letrasPorLinha) {
    showMessage("Digite 5 letras.");
    return;
  }
  const linhasElement = document.querySelector(`.row-${currentRow}`)!;


  const guess = Array.from(linhasElement.children)
    .map((box) => box.textContent?.toUpperCase() || "")
    .join("");
  console.log(guess);
  console.log(words.tentativasValidasFiltradas);
  if (!words.tentativasValidasFiltradas.includes(guess) && !words.respostasFiltradas.includes(guess)) {
    showMessage("Palavra inválida!");
    return;
  }

  guesses.push(guess);
  colorizeGuess(guess, currentRow);

  if (guess === words.palavraCerta) {
    showMessage("Parabéns! Você acertou a palavra!");
    document.removeEventListener("keydown", handleKeyPress);
  }



  currentRow++;
  currentCol = 0;
  atualizarEstilosDasLinhas();

  if (currentRow >= jogadas) {
    showMessage(`Fim de jogo! A palavra era: ${words.palavraCerta.toUpperCase()}`);
    document.removeEventListener("keydown", handleKeyPress);
  }
}
function colorizeGuess(guess: string, row: number) {
  const target = words.palavraCerta.split("");
  const result: ("correct" | "present" | "absent")[] = Array(letrasPorLinha).fill("absent");

  // Primeiro passo: letras na posição correta
  for (let i = 0; i < letrasPorLinha; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
      target[i] = ""; // Marca como usada
    }
  }

  // Segundo passo: letras corretas na posição errada
  for (let i = 0; i < letrasPorLinha; i++) {
    if (result[i] === "correct") continue;
    const idx = target.indexOf(guess[i]);
    if (idx !== -1) {
      result[i] = "present";
      target[idx] = ""; // Marca como usada
    }
  }

  const rowEl = document.querySelector(`.row-${row}`)!;
  for (let i = 0; i < letrasPorLinha; i++) {
    const box = rowEl.children[i] as HTMLElement;

    // Remove classes bg-* anteriores
    box.classList.remove("bg-white", "bg-gray-200", "bg-gray-700", "bg-yellow-500", "bg-green-500");

    if (result[i] === "correct") {
      box.classList.add("bg-green-500", "text-white", "border-none");
    } else if (result[i] === "present") {
      box.classList.add("bg-yellow-500", "text-white", "border-none");
    } else {
      box.classList.add("bg-gray-700", "text-white", "border-none");
    }
  }
}









