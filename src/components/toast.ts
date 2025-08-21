// src/components/toast.ts

let toastContainer: HTMLElement;
let messageTimer: number;

export function showMessage(msg: string, type: 'success' | 'error' = 'error', duration: number = 2000) {
    if (!toastContainer) {
        const container = document.getElementById('toast');
        if (!container) {
            console.error("Erro: Elemento do toast não encontrado no DOM. Verifique o id='toast' no seu HTML.");
            return;
        }
        toastContainer = container;
    }

    toastContainer.className = 'toast-container'; 
    toastContainer.classList.add(type); 
    
    const messageSpan = toastContainer.querySelector('#toast-message');
    if (messageSpan) {
        messageSpan.textContent = msg;
    }

    toastContainer.classList.add('visible');

    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
        toastContainer.classList.remove('visible');
    }, duration);
}