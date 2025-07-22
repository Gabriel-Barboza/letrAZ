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

            // Usa classList em vez de className
            caixa.classList.add('box');
            if (linhas === 0) {
                caixa.classList.add('box-active');
            } else {
                caixa.classList.add('box-inactive');
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
            
            // Não alterar linhas que já foram jogadas (têm cores de feedback)
            if (i < currentRow) {
                // Apenas restaura o cursor se tinha
                if (hasCursor) {
                    bloco.classList.add('cursor');
                }
                continue; // Pula para o próximo, mantendo as cores do feedback
            }

            if (i === currentRow) {
                // Linha atual - só adiciona classes se não tem cores de feedback
                if (!bloco.classList.contains('bg-green-500') && 
                    !bloco.classList.contains('bg-yellow-500') && 
                    !bloco.classList.contains('bg-gray-700')) {
                    
                    // Remove classes de linhas inativas e adiciona as ativas
                    bloco.classList.remove('box-inactive');
                    bloco.classList.add('box', 'box-active');
                }
            } else if (i > currentRow) {
                // Linhas futuras - remove classes ativas e adiciona inativas
                bloco.classList.remove('box-active', 'cursor');
                bloco.classList.add('box', 'box-inactive');
            }

            // Restaura cursor se tinha
            if (hasCursor) {
                bloco.classList.add('cursor');
            }
        }
    }
}