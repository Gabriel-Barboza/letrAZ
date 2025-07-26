// ===================================================================
// ===== COMPONENTE TOAST (NOTIFICAÇÕES) =============================
// ===================================================================
// Módulo para exibir mensagens temporárias (toasts) para o usuário.

const toastContainer = document.createElement('div');
document.body.appendChild(toastContainer);

let messageTimer: number;

/**
 * Mostra uma mensagem de notificação na tela.
 * @param msg A mensagem a ser exibida.
 * @param duration A duração em milissegundos (padrão: 2000ms).
 * @param type O tipo de mensagem, para estilização (padrão: 'error').
 */
export function showMessage(msg: string, duration: number = 2000, type: 'success' | 'error' = 'error') {
    // Configura o toast com as classes do CSS
    toastContainer.className = 'toast-container'; // Reseta as classes
    toastContainer.classList.add(type); // Adiciona o tipo (success ou error)
    toastContainer.textContent = msg;

    // Torna o toast visível
    toastContainer.classList.add('visible');

    // Limpa o timer anterior para evitar que o toast suma antes da hora
    clearTimeout(messageTimer);

    // Agenda o desaparecimento do toast
    messageTimer = window.setTimeout(() => {
        toastContainer.classList.remove('visible');
    }, duration);
}
