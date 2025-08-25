// src/components/keyboard.ts
import { getActiveGameState } from "../game/gameState";
import { palavraCerta } from "../game/words";
import { calculateAllKeyStatuses } from "../game/game";
import { EventBus } from "../eventBus";

let tecladoContainer: HTMLElement;

const layoutTeclado = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "backspace"],
    ["z", "x", "c", "v", "b", "n", "m", "enter"],
];

export function createKeyboard(
    keyHandler: (key: string, event?: KeyboardEvent) => void
) {
    const container = document.getElementById("keyboard");
    if (!container) {
        console.error(
            "Erro crítico: O contêiner do teclado com id='keyboard' não foi encontrado no HTML."
        );
        return;
    }
    tecladoContainer = container;

    tecladoContainer.innerHTML = "";
    layoutTeclado.forEach((linha) => {
        const linhaDiv = document.createElement("div");
        linhaDiv.className = "keyboard-row";
        linha.forEach((key) => {
            const teclaButton = document.createElement("button");
            teclaButton.className = "keyboard-key";
            teclaButton.textContent = key.toUpperCase();
            teclaButton.dataset.key = key;
            if (key === "backspace") teclaButton.innerHTML = "&#9003;";
            linhaDiv.appendChild(teclaButton);
        });
        tecladoContainer.appendChild(linhaDiv);
    });

    EventBus.on("guessSubmitted", updateKeyboardAppearance);
    EventBus.on("initialStateLoaded", updateKeyboardAppearance);

    tecladoContainer.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        const key = target.dataset.key;
        if (!key) return;

        keyHandler(key);
    });
}

export function updateKeyStatus(
    key: string,
    status: "correct" | "present" | "absent"
) {
    if (!tecladoContainer) return;
    const keyElement = tecladoContainer.querySelector(
        `[data-key="${key.toLowerCase()}"]`
    ) as HTMLElement;
    if (!keyElement) return;

    if (keyElement.classList.contains("correct")) return;
    if (keyElement.classList.contains("present") && status === "absent") return;

    keyElement.classList.remove("present", "absent", "correct");
    keyElement.classList.add(status);
}

export function updateKeyboardAppearance() {
    if (!tecladoContainer) return;
    const allKeys = tecladoContainer.querySelectorAll(".keyboard-key");
    allKeys.forEach((key) => {
        key.classList.remove("correct", "present", "absent");
    });

    const activeGameState = getActiveGameState();
    const allStatuses = calculateAllKeyStatuses(
        activeGameState.guesses,
        palavraCerta
    );

    for (const letter in allStatuses) {
        updateKeyStatus(letter, allStatuses[letter]);
    }
}
