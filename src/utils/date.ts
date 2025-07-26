// ===================================================================
// ===== UTILITÁRIOS DE DATA =========================================
// ===================================================================

/**
 * Retorna a data de hoje como uma string no formato "YYYY-MM-DD".
 * @returns {string} A data formatada.
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
