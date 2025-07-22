import { PLAYS, LETTERS } from './gameState';

const grid = document.getElementById("tabuleiro")!;
export const menssagem = document.getElementById("message")!;

export function createBoard(handleClick: (row: number, col: number) => void) {
  for (let linhas = 0; linhas < PLAYS; linhas++) {
    const linhasElement = document.createElement("div");
    linhasElement.className = `grid grid-cols-5 gap-2 row-${linhas}`;

    for (let letras = 0; letras < LETTERS; letras++) {
      const caixa = document.createElement("div");

      caixa.addEventListener("click", () => {
        handleClick(linhas, letras);
      });

      if (linhas === 0) {
        caixa.className = "box box-active";
      } else {
        caixa.className = "box box-inactive";
      }

      linhasElement.appendChild(caixa);
    }

    grid.appendChild(linhasElement);
  }
}

export function CurrentBox(col: number, row: number) {
  const previousCursor = document.querySelector('.cursor');
  if (previousCursor) {
    previousCursor.classList.remove('cursor');
  }

  const activeRow = document.querySelector(`.row-${row}`);
  if (!activeRow) return;

  if (col >= 0 && col < LETTERS) {
    const activeBox = activeRow.children[col] as HTMLElement;
    if (activeBox) {
      activeBox.classList.add('cursor');
    }
  }
}

export function updateBox(letter: string, row: number, col: number) {
  const linhasElement = document.querySelector(`.row-${row}`)!;
  const caixa = linhasElement.children[col] as HTMLElement;
  caixa.textContent = letter.toUpperCase();
}

export function atualizarEstilosDasLinhas(currentRow: number) {
  for (let i = 0; i < PLAYS; i++) {
    const linha = document.querySelector(`.row-${i}`)!;
    for (let j = 0; j < LETTERS; j++) {
      const bloco = linha.children[j] as HTMLElement;
      const hasCursor = bloco.classList.contains('cursor');
      
      if (i < currentRow) {
        if (hasCursor) {
          bloco.classList.add('cursor');
        }
        continue;
      }

      if (i === currentRow) {
        bloco.className = "box box-active";
      } else if (i > currentRow) {
        bloco.className = "box box-inactive";
      }

      if (hasCursor) {
        bloco.classList.add('cursor');
      }
    }
  }
}