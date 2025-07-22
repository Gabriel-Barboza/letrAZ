import { PLAYS, LETTERS } from './gameState';

const tecladoContainer = document.getElementById("keyboard")!;

// Define o layout das teclas em linhas
const layoutTeclado = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l' ,'backspace'],
    [ 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'enter']
];

export function createKeyboard(handleKeyPress: (event: KeyboardEvent) => void) {
    // Itera sobre o layout para criar as teclas
    layoutTeclado.forEach(linha => {
        const linhaDiv = document.createElement("div");
        linhaDiv.className = "keyboard-row";

        linha.forEach(key => {
            const teclaButton = document.createElement("button");
            teclaButton.className = "keyboard-key";

            // Define o texto e o data-key
            teclaButton.textContent = key.toUpperCase();
            teclaButton.dataset.key = key;

            // Estiliza teclas especiais
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

    // Adiciona o event listener
    tecladoContainer.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target.classList.contains('keyboard-key')) {
            return;
        }

        const key = target.dataset.key;
        if (key) {
            const virtualKeyboard = ({ key: key } as KeyboardEvent);
            handleKeyPress(virtualKeyboard);
        }
    });
}