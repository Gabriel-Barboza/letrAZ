

const toastContainer = document.createElement('div');
document.body.appendChild(toastContainer);


let messageTimer: number;
export function showMessage(msg: string, type: 'success' | 'error' = 'error', duration: number = 2000) {

    toastContainer.className = 'toast-container'; 
    toastContainer.classList.add(type); 
    toastContainer.textContent = msg;

    toastContainer.classList.add('visible');


    clearTimeout(messageTimer);

    messageTimer = setTimeout(() => {
        toastContainer.classList.remove('visible');
    }, duration);
}