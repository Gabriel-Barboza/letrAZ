import { PLAYS, LETTERS } from './types';

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
export function colorizeRow(statuses: ("correct" | "present" | "absent")[], row: number) {
    const rowEl = document.querySelector(`.row-${row}`);
    if (!rowEl) return;

    for (let i = 0; i < LETTERS; i++) {
        const box = rowEl.children[i] as HTMLElement;
        
        // Limpeza completa: remove qualquer estilo de digitação ou de estado anterior.
        box.classList.remove("box-active", "box-inactive", "cursor"); 

        // Adiciona a classe de cor correspondente ao status.
        // As cores em si (bg-green-500, etc.) devem estar no seu CSS.
        if (statuses[i] === "correct") {
            box.classList.add("bg-green-500", "text-white", "border-none");
        } else if (statuses[i] === "present") {
            box.classList.add("bg-yellow-500", "text-white", "border-none");
        } else {
            box.classList.add("bg-gray-700", "text-white", "border-none");
        }
    }
}
export function atualizarEstilosDasLinhas(currentRow: number) {
    for (let i = 0; i < PLAYS; i++) {
        const linha = document.querySelector(`.row-${i}`)!;
        const primeiroBloco = linha.children[0] as HTMLElement;

        // ✅ CORREÇÃO: Se a linha já foi colorida (ex: tem bg-green-500), não faz nada.
        // Isso preserva as cores das tentativas anteriores ao recarregar a página.
        if (primeiroBloco.classList.contains('bg-green-500') || 
            primeiroBloco.classList.contains('bg-yellow-500') || 
            primeiroBloco.classList.contains('bg-gray-700')) {
            continue;
        }

        for (let j = 0; j < LETTERS; j++) {
            const bloco = linha.children[j] as HTMLElement;
            
            // Remove estilos antigos para evitar conflitos
            bloco.classList.remove('box-active', 'box-inactive');

            // Adiciona o estilo correto
            if (i === currentRow) {
                bloco.classList.add("box-active"); // Define a linha atual como ativa
            } else {
                bloco.classList.add("box-inactive"); // Define as futuras como inativas
            }
        }
    }
}