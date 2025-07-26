// ===================================================================
// ===== GERENCIADOR DE ESTADO =======================================
// ===================================================================
// Responsável por criar, carregar e salvar o estado do jogo,
// usando o localStorage para persistência.

import type { SaveData } from '../types';
import { getTodayDateString } from '../utils/date';

/** Cria o estado inicial para um novo jogo. */
function createInitialState(): SaveData {
  return {
    stats: {
      gamesPlayed: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      winDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    gameState: {
      guesses: [],
      currentRow: 0,
      currentCol: 0,
      isGameOver: false,
      isComplete: false,
      date: getTodayDateString(),
    }
  };
}

// ===== A ÚNICA FONTE DA VERDADE PARA O ESTADO DO JOGO =====
export let state: SaveData;
// ==========================================================

/**
 * Carrega o estado do localStorage. Se for um novo dia, reinicia o
 * estado do jogo, mas mantém as estatísticas.
 */
export function initializeState() {
  const savedDataString = localStorage.getItem('gameData');
  
  if (savedDataString) {
    const savedData: SaveData = JSON.parse(savedDataString);
    const today = getTodayDateString();

    // Se a data salva for de um dia anterior, reseta o estado do JOGO, mas mantém as ESTATÍSTICAS
    if (savedData.gameState.date !== today) {
      state = createInitialState(); // Cria um novo jogo
      state.stats = savedData.stats; // Mas carrega as estatísticas antigas
    } else {
      // Se for o mesmo dia, apenas carrega tudo
      state = savedData;
    }
  } else {
    // Se não há nada salvo, cria um estado novo do zero
    state = createInitialState();
  }
}

/** Salva o estado atual no localStorage. */
export function saveState() {
  localStorage.setItem('gameData', JSON.stringify(state));
}
