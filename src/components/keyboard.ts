// ===================================================================
// ===== COMPONENTE KEYBOARD (TECLADO VIRTUAL) =======================
// ===================================================================
// Responsável por criar o teclado virtual e lidar com seus eventos.

import type { LetterStatus } from "../types";

const keyboardContainer = document.getElementById("keyboard")!;

const KEYBOARD_LAYOUT = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'backspace'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'enter']
];

/**
 * Cria o teclado virtual no DOM.
 * @param onKeyPress - Callback executado quando uma tecla é pressionada.
 */
export function createKeyboard(onKeyPress: (key: string) => void) {
    KEYBOARD_LAYOUT.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "keyboard-row";

        row.forEach(key => {
            const keyButton = document.createElement("button");
            keyButton.className = "keyboard-key";
            keyButton.textContent = key.toUpperCase();
            keyButton.dataset.key = key;

            if (key === 'enter' || key === 'backspace') {
                keyButton.classList.add('keyboard-key-large');
                if (key === 'backspace') {
                    keyButton.innerHTML = '&#9003;'; // Ícone de backspace
                }
            }
            rowDiv.appendChild(keyButton);
        });
        keyboardContainer.appendChild(rowDiv);
    });

    keyboardContainer.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const key = target.closest('[data-key]')?.getAttribute('data-key');
        if (key) {
            onKeyPress(key);
        }
    });
}

/**
 * Atualiza a cor de uma tecla no teclado virtual com base no seu status.
 * A lógica impede que uma tecla 'correct' (verde) seja sobrescrita
 * por 'present' (amarelo), que é uma prioridade menor.
 * @param letter A letra a ser atualizada.
 * @param status O novo status da letra.
 */
export function updateKeyStatus(letter: string, status: LetterStatus) {
    const keyElement = keyboardContainer.querySelector(`[data-key="${letter.toLowerCase()}"]`) as HTMLElement;
    if (!keyElement) return;

    // Não sobrescreve uma tecla que já está correta
    if (keyElement.classList.contains('correct')) return;

    // Remove status antigos (exceto 'correct')
    keyElement.classList.remove('present', 'absent');

    // Adiciona o novo status
    if (status === 'correct') {
        keyElement.classList.add('correct');
    } else if (status === 'present') {
        keyElement.classList.add('present');
    } else if (status === 'absent' && !keyElement.classList.contains('present')) {
        // Só marca como ausente se não estiver marcada como presente
        keyElement.classList.add('absent');
    }
}
