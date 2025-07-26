// ===================================================================
// ===== COMPONENTE BOARD (TABULEIRO) ================================
// ===================================================================
// Responsável por toda a manipulação do DOM referente ao tabuleiro.

import { PLAYS, LETTERS } from '../config';
import type { LetterStatus } from '../types';

const boardElement = document.getElementById("tabuleiro")!;

/**
 * Cria a grade inicial do tabuleiro no DOM.
 * @param onBoxClick - Callback executado quando uma caixa é clicada.
 */
export function createBoard(onBoxClick: (row: number, col: number) => void) {
    for (let i = 0; i < PLAYS; i++) {
        const rowElement = document.createElement("div");
        rowElement.className = `grid grid-cols-5 gap-2 row-${i}`;

        for (let j = 0; j < LETTERS; j++) {
            const boxElement = document.createElement("div");
            boxElement.className = 'box box-inactive';
            boxElement.addEventListener("click", () => onBoxClick(i, j));
            rowElement.appendChild(boxElement);
        }
        boardElement.appendChild(rowElement);
    }
}

/**
 * Atualiza o conteúdo de uma única caixa no tabuleiro.
 * @param letter A letra para exibir (ou string vazia para limpar).
 * @param row A linha da caixa.
 * @param col A coluna da caixa.
 */
export function updateBox(letter: string, row: number, col: number) {
    const rowElement = boardElement.querySelector(`.row-${row}`);
    if (!rowElement) return;
    
    const boxElement = rowElement.children[col] as HTMLElement;
    if (boxElement) {
        boxElement.textContent = letter.toUpperCase();
    }
}

/**
 * Move o cursor visual para uma nova posição no tabuleiro.
 * @param row A linha do cursor.
 * @param col A coluna do cursor.
 */
export function updateCursorPosition(row: number, col: number) {
    // Remove o cursor antigo
    const previousCursor = boardElement.querySelector('.cursor');
    if (previousCursor) {
        previousCursor.classList.remove('cursor');
    }

    // Adiciona o novo cursor se a coluna for válida
    const activeRow = boardElement.querySelector(`.row-${row}`);
    if (activeRow && col >= 0 && col < LETTERS) {
        const activeBox = activeRow.children[col] as HTMLElement;
        if (activeBox) {
            activeBox.classList.add('cursor');
        }
    }
}

/**
 * Colore uma linha inteira do tabuleiro com base no resultado da tentativa.
 * @param statuses O array de status ('correct', 'present', 'absent') para a linha.
 * @param row O número da linha a ser colorida.
 */
export function colorizeRow(statuses: LetterStatus[], row: number) {
    const rowElement = boardElement.querySelector(`.row-${row}`);
    if (!rowElement) return;

    for (let i = 0; i < LETTERS; i++) {
        const box = rowElement.children[i] as HTMLElement;
        
        // Limpeza completa: remove qualquer estilo de digitação ou de estado anterior.
        box.classList.remove("box-active", "box-inactive", "cursor"); 

        // Adiciona a classe de status final ('correct', 'present', ou 'absent').
        const status = statuses[i];
        box.classList.add(status);
    }
}

/**
 * Atualiza os estilos das linhas, marcando a atual como 'ativa' e as futuras como 'inativas'.
 * Esta versão possui uma proteção explícita para NUNCA modificar uma linha que já foi colorida.
 */
export function updateRowStyles(currentRow: number) {
    for (let i = 0; i < PLAYS; i++) {
        const rowElement = boardElement.querySelector(`.row-${i}`);
        if (!rowElement) continue;

        const firstBox = rowElement.children[0] as HTMLElement;
        if (!firstBox) continue;

        // PROTEÇÃO DEFINITIVA: Se a primeira caixa já tem uma cor, esta linha foi jogada.
        // Ignora a linha inteira e passa para a próxima.
        if (firstBox.classList.contains('correct') || firstBox.classList.contains('present') || firstBox.classList.contains('absent')) {
            continue;
        }

        // Apenas para linhas que NÃO foram jogadas, define o estilo de digitação.
        for (let j = 0; j < LETTERS; j++) {
            const box = rowElement.children[j] as HTMLElement;
            if (i === currentRow) {
                box.classList.remove('box-inactive');
                box.classList.add('box-active');
            } else {
                box.classList.remove('box-active');
                box.classList.add('box-inactive');
            }
        }
    }
}