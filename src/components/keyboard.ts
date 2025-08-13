// src/components/keyboard.ts

// --- IMPORTS ---
// Importa as ferramentas de que precisa: o estado, a lógica de cálculo e a palavra certa.
import { getState } from "../game/gameState";
import { calculateAllKeyStatuses } from "../game/game";
import { palavraCerta } from "../game/words";

const tecladoContainer = document.getElementById("keyboard")!;

// --- CRIAÇÃO INICIAL DO DOM ---
// Esta função não muda. Sua responsabilidade é apenas criar os botões e os listeners.
const layoutTeclado = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l' ,'backspace'],
    [ 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'enter']
];

export function createKeyboard(handleKeyPress: (event: KeyboardEvent) => void) {
    layoutTeclado.forEach(linha => {
        const linhaDiv = document.createElement("div");
        linhaDiv.className = "keyboard-row";

        linha.forEach(key => {
            const teclaButton = document.createElement("button");
            teclaButton.className = "keyboard-key";
            teclaButton.textContent = key.toUpperCase();
            teclaButton.dataset.key = key;

            if (key === 'enter' || key === 'backspace') {
                teclaButton.classList.add('keyboard-key-large');
                if (key === 'backspace') {
                    teclaButton.innerHTML = '&#9003;';
                }
            }

            linhaDiv.appendChild(teclaButton);
        });

        tecladoContainer.appendChild(linhaDiv);
    });

    tecladoContainer.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target.classList.contains('keyboard-key')) return;

        const key = target.dataset.key;
        if (key) {
            handleKeyPress({ key: key } as KeyboardEvent);
        }
    });
}


// --- LÓGICA DE ATUALIZAÇÃO DA UI ---

// 1. A "Operária": Sabe apenas como pintar UMA tecla. Perfeito.
export function updateKeyStatus(key: string, status: 'correct' | 'present' | 'absent') {
    const keyElement = tecladoContainer.querySelector(`[data-key="${key.toLowerCase()}"]`) as HTMLElement;
    if (!keyElement) return;

    if (keyElement.classList.contains('correct')) return;
    if (keyElement.classList.contains('present') && status === 'absent') return;

    keyElement.classList.remove('present', 'absent');
    keyElement.classList.add(status);
}


// 2. A "Maestro": Orquestra a atualização completa do teclado.
// Esta é a única função que precisa ser chamada de fora para atualizar tudo.
export function updateKeyboardAppearance() {
    // a. Pega os dados do estado do jogo
    const guesses = getState().guesses;

    // b. Pede ajuda ao módulo de lógica para calcular os status
    const allStatuses = calculateAllKeyStatuses(guesses, palavraCerta);

    // c. Manda a "operária" (updateKeyStatus) pintar cada tecla com base nos resultados
    for (const letter in allStatuses) {
        updateKeyStatus(letter, allStatuses[letter]);
    }
}