# LetrAZ

Um jogo de adivinhação de palavras para a web, inspirado no popular jogo **Wordle** e em sua versão brasileira, o **Termo**.  
O objetivo é adivinhar uma palavra secreta de **cinco letras** em até **cinco tentativas**.

Este projeto foi desenvolvido com **TypeScript**, **Vite** e **Tailwind CSS**.

---

## 🚀 Funcionalidades

- **🎮 Jogabilidade Clássica:** Adivinhe uma palavra de 5 letras em 5 tentativas.
- **📆 Palavra do Dia:** Uma nova palavra é selecionada diariamente com base na data, sendo a mesma para todos os jogadores.
- **🎨 Feedback por Cores:**  
  - 🟩 **Verde (correct):** A letra está na palavra e na posição correta.  
  - 🟨 **Amarelo (present):** A letra está na palavra, mas na posição incorreta.  
  - ⬜ **Cinza (absent):** A letra não faz parte da palavra.
- **✅ Validação de Palavras:** Apenas palavras válidas são aceitas.
- **⌨️ Teclado Virtual Interativo:** Permite jogar com cliques e mostra o status de cada letra.
- **💾 Salvamento de Progresso:** Estado do jogo e estatísticas são armazenados no `localStorage`.
- **🔔 Notificações (Toasts):** Informações animadas sobre ações do jogador.

---

## 🎮 Como Jogar

1. **Objetivo:** Adivinhar a palavra secreta de cinco letras.
2. **Digite um Palpite:** Use seu teclado físico ou o teclado virtual.
3. **Submeta:** Pressione `Enter`.
4. **Analise as Dicas:** As cores indicam o quão perto você está da resposta.
5. **Continue Tentando:** Você tem até 5 tentativas.

---

## 🛠️ Tecnologias Utilizadas

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- HTML5

---

## 📂 Estrutura do Projeto

```
📁 src/
│
├── 📄 main.ts          # Ponto de entrada da aplicação
├── 📄 game.ts          # Lógica central do jogo (validação, dicas, salvamento)
├── 📄 board.ts         # Criação e manipulação do tabuleiro
├── 📄 keyboard.ts      # Teclado virtual e eventos de clique
├── 📄 gameState.ts     # Estado do jogo e estatísticas do jogador
├── 📄 words.ts         # Lista de palavras e seleção da palavra do dia
├── 📄 types.ts         # Tipos e constantes globais
├── 📄 style.css        # Estilos base com Tailwind
```

---

## ⚙️ Instalação e Execução

Siga os passos abaixo para rodar o projeto localmente:

### 1. Clone o Repositório

```bash
git clone https://github.com/Gabriel-Barboza/letrAZ.git
cd letrAZ
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Execute o Servidor de Desenvolvimento

```bash
npm run dev
```

### 4. Acesse no Navegador

Abra o navegador e vá até a URL fornecida pelo Vite, normalmente:

```
http://localhost:5173
```

---

## 📜 Licença

Este projeto é open source e está licenciado sob a [MIT License](LICENSE).

---

## ✨ Contribuições

Sinta-se à vontade para abrir *issues* ou enviar *pull requests* com melhorias, correções ou novas funcionalidades! 🚀
