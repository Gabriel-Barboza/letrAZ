

const toastContainer = document.createElement('div');
document.body.appendChild(toastContainer);


let messageTimer: number;
export function showMessage(msg: string, type: 'success' | 'error' = 'error', duration: number = 2000) {
    // Configura o toast com as classes do seu CSS
    toastContainer.className = 'toast-container'; // Reseta as classes
    toastContainer.classList.add(type); // Adiciona o tipo (success ou error)
    toastContainer.textContent = msg;

    // Torna o toast visível
    toastContainer.classList.add('visible');

    // Limpa o timer anterior para evitar que o toast suma antes da hora
    clearTimeout(messageTimer);

    // Agenda o desaparecimento do toast
    messageTimer = setTimeout(() => {
        toastContainer.classList.remove('visible');
    }, duration);
}