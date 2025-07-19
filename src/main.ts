import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.ts'
import { respostas, respostasFiltradas, tentativasValidasFiltradas } from './words';


const dataFixa = new Date('2025-07-18T00:00:00')
const hoje = new Date();

function indexPalavra(dataFixa: Date, hoje : Date): number {
  
  return Math.floor((hoje.getTime() % dataFixa.getTime()) / (1000 * 60 * 60 * 24));

}
const index = indexPalavra(dataFixa, hoje);
console.log(respostasFiltradas);
console.log(respostasFiltradas[index]);
console.log("Index da palavra do dia:", index);


console.log("Data fixa:", dataFixa);
console.log("Data de hoje:", hoje);

 document.addEventListener('DOMContentLoaded', () => {
    const linhas = Array.from(document.querySelectorAll('#word-form > div'));
    linhas.forEach((linha, idx) => {
      const inputs = linha.querySelectorAll('input');
      // Desabilita todas as linhas menos a primeira
      if (idx !== 0) inputs.forEach(input => input.disabled = true);

      inputs.forEach((input, i) => {
        input.addEventListener('input', (e) => {
          if (input.value.length === 1 && i < inputs.length - 1) {
            inputs[i + 1].focus();
          }
          // Se todos preenchidos, habilita próxima linha
          if (Array.from(inputs).every(inp => inp.value.length === 1)) {
            if (linhas[idx + 1]) {
              linhas[idx + 1].querySelectorAll('input').forEach(inp => inp.disabled = false);
              const nextInput = linhas[idx + 1].querySelector('input');
              if (nextInput) {
                nextInput.focus();
              }
            }
          }
        });
      });
    });
  });