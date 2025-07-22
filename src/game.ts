import * as words from "./words";
import { gameState, LETTERS, PLAYS, gameData, getTodayDate } from "./gameState";
import * as board from "./board";

const toastElement = document.getElementById("toast")!;
const toastMessageElement = document.getElementById("toast-message")!;
let toastTimer: number;

export function colorizeGuess(guess: string, row: number) {
    const target = words.palavraCerta.split("");
    const result: ("correct" | "present" | "absent")[] = Array(LETTERS).fill("absent");

    for (let i = 0; i < LETTERS; i++) {
        if (guess[i] === target[i]) {
            result[i] = "correct";
            target[i] = "";
        }
    }

    for (let i = 0; i < LETTERS; i++) {
        if (result[i] === "correct") continue;
        const idx = target.indexOf(guess[i]);
        if (idx !== -1) {
            result[i] = "present";
            target[idx] = "";
        }
    }

    const rowEl = document.querySelector(`.row-${row}`)!;
    for (let i = 0; i < LETTERS; i++) {
        const box = rowEl.children[i] as HTMLElement;
        box.classList.remove("box-active");
        if (result[i] === "correct") {
            box.classList.add("bg-green-500", "text-white", "border-none");
        } else if (result[i] === "present") {
            box.classList.add("bg-yellow-500", "text-white", "border-none");
        } else {
            box.classList.add("bg-gray-700", "text-white", "border-none");
        }

        const letter = guess[i].toLowerCase();
        const status = result[i];
        const keyElement = document.querySelector(`.keyboard-key[data-key="${letter}"]`);

        if (keyElement) {
            if (status === 'correct') {
                keyElement.classList.remove('present', 'absent');
                keyElement.classList.add('correct');
            } else if (status === 'present' && !keyElement.classList.contains('correct')) {
                keyElement.classList.remove('absent');
                keyElement.classList.add('present');
            } else if (status === 'absent' && !keyElement.classList.contains('correct') && !keyElement.classList.contains('present')) {
                keyElement.classList.add('absent');
            }
        }
    }
}

function showMessage(msg: string, type: 'success' | 'error', duration: number = 4000) {
    clearTimeout(toastTimer);
    toastMessageElement.textContent = msg;
    toastElement.classList.remove('success', 'error');
    toastElement.classList.add(type);
    toastElement.classList.add('visible');
    toastTimer = setTimeout(() => {
        toastElement.classList.remove('visible');
    }, duration);
}

export function submitGuess() {
    const linhasElement = document.querySelector(`.row-${gameState.currentRow}`)!;
    const guess = Array.from(linhasElement.children)
        .map((box) => box.textContent?.toUpperCase() || "")
        .join("");

    if (guess.length < LETTERS) {
        showMessage("Digite 5 letras.", 'error');
        return;
    }
    if (
        !words.tentativasValidasFiltradas.includes(guess) &&
        !words.respostasFiltradas.includes(guess)
    ) {
        showMessage("Palavra inválida!", 'error');
        return;
    }

    gameState.guesses.push(guess);
    colorizeGuess(guess, gameState.currentRow);

    if (guess === words.palavraCerta) {
        showMessage("Parabéns! Você acertou a palavra!", 'success');
        gameState.isGameOver = true;
        saveGame(true);
        document.querySelector(".cursor")?.classList.remove("cursor");
        return;
    }

    gameState.currentRow++;
    gameState.currentCol = 0;

    // Atualiza a próxima linha para ficar ativa
    if (gameState.currentRow < PLAYS) {
        const proximaLinha = document.querySelector(`.row-${gameState.currentRow}`)!;
        for (let i = 0; i < LETTERS; i++) {
            const caixa = proximaLinha.children[i] as HTMLElement;
            caixa.classList.remove('box-inactive');
            caixa.classList.add('box-active');
        }
    }

    if (guess != words.palavraCerta) {
        board.CurrentBox(gameState.currentCol, gameState.currentRow);
    }

    // Salva o progresso após cada tentativa
    saveProgress();

    if (gameState.currentRow >= PLAYS) {
        showMessage(
            `Fim de jogo! A palavra era: ${words.palavraCerta.toUpperCase()}`,
            'error'
        );
        gameState.isGameOver = true;
        saveGame(false);
        document.querySelector(".cursor")?.classList.remove("cursor");
        return;
    }
}
function saveGame(didWin: boolean) {
    const data = loadGame() || { ...gameData };
    
    data.stats.gamesPlayed++;
    if (didWin) {
        data.stats.wins++;
        data.stats.currentStreak++;
        if (data.stats.currentStreak > data.stats.maxStreak) {
            data.stats.maxStreak = data.stats.currentStreak;
        }
        data.stats.winDistribution[gameState.currentRow + 1]++;
    } else {
        data.stats.currentStreak = 0;
    }

    data.gameState.isComplete = true;
    data.gameState.boardState = gameState.guesses;
    data.gameState.solution = words.palavraCerta;
    data.gameState.rowIndex = gameState.currentRow;
    data.gameState.currentCol = gameState.currentCol;
    data.gameState.gameDate = getTodayDate();

    localStorage.setItem('gameData', JSON.stringify(data));
}

function saveProgress() {
    const data = loadGame() || { ...gameData };
    
    data.gameState.boardState = gameState.guesses;
    data.gameState.solution = words.palavraCerta;
    data.gameState.rowIndex = gameState.currentRow;
    data.gameState.currentCol = gameState.currentCol;
    data.gameState.gameDate = getTodayDate();
    data.gameState.isComplete = false;

    localStorage.setItem('gameData', JSON.stringify(data));
}

export function loadGame() {
    const dataString = localStorage.getItem('gameData');
    if (dataString) {
        return JSON.parse(dataString);
    }
    return null;
}

export function loadProgress(): boolean {
    const savedData = loadGame();
    if (!savedData) return false;

    const today = getTodayDate();
    
    // Se não é o mesmo dia, não carrega o progresso
    if (savedData.gameState.gameDate !== today) {
        return false;
    }

    // Se o jogo já foi completado hoje, mostra o resultado
    if (savedData.gameState.isComplete) {
        gameState.guesses = savedData.gameState.boardState;
        gameState.currentRow = savedData.gameState.rowIndex;
        gameState.currentCol = savedData.gameState.currentCol;
        gameState.isGameOver = true;
        
        // Reconstrói o tabuleiro com as tentativas salvas
        restoreBoard();
        return true;
    }

    // Se o jogo está em progresso, restaura o estado
    if (savedData.gameState.boardState.length > 0) {
        gameState.guesses = savedData.gameState.boardState;
        gameState.currentRow = savedData.gameState.rowIndex;
        gameState.currentCol = savedData.gameState.currentCol;
        
        // Reconstrói o tabuleiro com as tentativas salvas
        restoreBoard();
        return true;
    }

    return false;
}

function restoreBoard() {
    // Limpa o cursor anterior
    document.querySelector('.cursor')?.classList.remove('cursor');
    
    // PRIMEIRO: Configura os estilos base de todas as linhas
    for (let i = 0; i < PLAYS; i++) {
        const linha = document.querySelector(`.row-${i}`)!;
        for (let j = 0; j < LETTERS; j++) {
            const bloco = linha.children[j] as HTMLElement;
            
            // Remove todas as classes primeiro
            bloco.className = '';
            
            // Adiciona classes base
            bloco.classList.add('box');
            
            if (i === gameState.currentRow && !gameState.isGameOver) {
                bloco.classList.add('box-active');
            } else if (i > gameState.currentRow) {
                bloco.classList.add('box-inactive');
            }
        }
    }
    
    // DEPOIS: Reconstrói cada linha com as tentativas salvas
    gameState.guesses.forEach((guess, rowIndex) => {
        const linhasElement = document.querySelector(`.row-${rowIndex}`)!;
        
        // Preenche as letras
        for (let i = 0; i < LETTERS; i++) {
            const caixa = linhasElement.children[i] as HTMLElement;
            caixa.textContent = guess[i] || "";
        }
        
        // Aplica as cores (isso vai sobrescrever os estilos base)
        colorizeGuess(guess, rowIndex);
    });
    
    // Se o jogo não acabou, posiciona o cursor
    if (!gameState.isGameOver) {
        board.CurrentBox(gameState.currentCol, gameState.currentRow);
    }
}