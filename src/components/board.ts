// src/components/board.ts

import { PLAYS, LETTERS } from '../types';
import { subscribe, getState } from '../game/gameState';
import type { CurrentGameState } from '../types';
import { evaluateGuess } from '../game/game';
import { palavraCerta } from '../game/words';

const grid = document.getElementById("tabuleiro")!;

// --- FUNÇÃO DE RENDERIZAÇÃO (O Coração do Módulo) ---
// Esta função é chamada toda vez que o estado do jogo muda.
// Ela é responsável por desenhar TUDO no tabuleiro.
function renderBoard(gameState: CurrentGameState) {
    // Itera por todas as linhas do tabuleiro (0 a 4)
    for (let i = 0; i < PLAYS; i++) {
        const rowEl = grid.children[i] as HTMLElement;
        const guess = gameState.guesses[i] || "";
        
        // Determina se a linha já foi jogada e deve ser colorida
        const isSubmitted = i < gameState.currentRow || (i === gameState.currentRow && gameState.isComplete);
        const statuses = isSubmitted ? evaluateGuess(guess, palavraCerta) : [];

        // Itera por todas as caixas (letras) da linha
        for (let j = 0; j < LETTERS; j++) {
            const box = rowEl.children[j] as HTMLElement;
            box.textContent = guess[j] || "";
            
            // 1. Limpa todos os estilos anteriores
            box.className = 'box'; // Reseta para a classe base

            // 2. Aplica a cor, se a linha já foi submetida
            if (isSubmitted) {
                box.classList.add(statuses[j]); // Adiciona 'correct', 'present' ou 'absent'
            } else if (i === gameState.currentRow) {
                // 3. Aplica o estilo de linha ativa
                box.classList.add('box-active');
            } else {
                // 4. Aplica o estilo de linha inativa
                box.classList.add('box-inactive');
            }
        }
    }
    
    // 5. Posiciona o cursor na caixa correta
    if (!gameState.isGameOver) {
        CurrentBox(gameState.currentCol, gameState.currentRow);
    } else {
        // Se o jogo acabou, remove o cursor
        const cursor = document.querySelector('.cursor');
        if (cursor) cursor.classList.remove('cursor');
    }
}

// --- FUNÇÕES AUXILIARES ---

function CurrentBox(col: number, row: number) {
    const previousCursor = document.querySelector('.cursor');
    if (previousCursor) {
        previousCursor.classList.remove('cursor');
    }

    const activeRow = grid.children[row] as HTMLElement;
    if (!activeRow) return;

    if (col >= 0 && col < LETTERS) {
        const activeBox = activeRow.children[col] as HTMLElement;
        if (activeBox) {
            activeBox.classList.add('cursor');
        }
    }
}

// Esta função não é mais estritamente necessária pois a renderBoard faz tudo,
// mas a mantemos caso queira usá-la em outro lugar.
export function updateBox(letter: string, row: number, col: number) {
    const linhasElement = grid.children[row] as HTMLElement;
    if (linhasElement) {
        const caixa = linhasElement.children[col] as HTMLElement;
        caixa.textContent = letter.toUpperCase();
    }
}

// --- FUNÇÃO DE CRIAÇÃO DO DOM ---
// Apenas cria os divs vazios. Não tem mais lógica de clique ou estilo.
function createBoard(handleClick: (row: number, col: number) => void) {
    grid.innerHTML = ''; 
    for (let linhas = 0; linhas < PLAYS; linhas++) {
        const linhasElement = document.createElement("div");
        linhasElement.className = `grid grid-cols-5 gap-2 row-${linhas}`;

        for (let letras = 0; letras < LETTERS; letras++) {
            const caixa = document.createElement("div");
            caixa.classList.add('box');
            // Adiciona o listener de clique a cada caixa
            caixa.addEventListener("click", () => handleClick(linhas, letras));
            linhasElement.appendChild(caixa);
        }
        grid.appendChild(linhasElement);
    }
}

// --- FUNÇÃO DE INICIALIZAÇÃO (MODIFICADA) ---
// Agora ela aceita o callback e o repassa para createBoard.
export function initializeBoard(handleClick: (row: number, col: number) => void) {
    // 1. Cria a estrutura HTML, agora passando a função de clique
    createBoard(handleClick);

    // 2. Inscreve o board para ouvir mudanças de estado
    subscribe(renderBoard);

    // 3. Renderiza o estado inicial
    renderBoard(getState());
}
