

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
    export function updateKeyStatus(key: string, status: 'correct' | 'present' | 'absent') {
    const keyElement = tecladoContainer.querySelector(`[data-key="${key.toLowerCase()}"]`) as HTMLElement;
    if (!keyElement) return;

    // Prioridade de status: não rebaixa uma tecla que já está correta.
    if (keyElement.classList.contains('correct')) return;
    
    // Não rebaixa uma tecla presente para ausente.
    if (keyElement.classList.contains('present') && status === 'absent') return;

    // Remove status de cor antigos para aplicar o novo.
    keyElement.classList.remove('present', 'absent');

    // Adiciona a classe de status correspondente ('correct', 'present', ou 'absent').
    // O seu style.css cuidará da cor com base nessas classes.
    keyElement.classList.add(status);

}
