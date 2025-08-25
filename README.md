# LetrAZ

Um jogo de adivinhação de palavras para a web, inspirado no popular jogo **Wordle** e em sua versão brasileira, o **Termo**. O objetivo é adivinhar uma palavra secreta de **cinco letras** em até **cinco tentativas**.

Este projeto foi desenvolvido com **TypeScript**, **Vite** e **Tailwind CSS**, focando em uma experiência de jogo limpa, responsiva e com múltiplas modalidades para desafiar os jogadores.

---

## 🚀 Funcionalidades

-   **🎮 Jogabilidade Clássica:** Adivinhe uma palavra de 5 letras em 5 tentativas, com um dicionário de palavras válidas para garantir o desafio.

-   **🕹️ Múltiplos Modos de Jogo:**
    -   **📅 Diário:** O modo clássico, com uma nova palavra a cada dia, a mesma para todos os jogadores. O progresso diário é salvo para que você possa continuar mais tarde.
    -   **♾️ Livre:** Jogue quantas vezes quiser! Cada nova partida seleciona uma palavra aleatória para um desafio sem fim.
    -   **⚡ Rush:** Teste sua agilidade e vocabulário contra o tempo! Acerte uma sequência de 10 palavras, com um cronômetro de 25 segundos para cada uma e um sistema de pontuação baseado em tempo e acertos.

-   **🎨 Feedback por Cores:**
    -   🟩 **Verde (correct):** A letra está na palavra e na posição correta.
    -   🟨 **Amarelo (present):** A letra está na palavra, mas na posição incorreta.
    -   ⬜ **Cinza (absent):** A letra não faz parte da palavra.

-   **⌨️ Teclado Virtual Interativo:** Jogue usando o teclado na tela, que se atualiza com as cores correspondentes às letras já utilizadas, ajudando a criar estratégias para as próximas tentativas.

-   **💾 Salvamento de Progresso:** O estado do jogo do modo diário e as estatísticas de todos os modos (jogos, vitórias, sequências) são armazenados no `localStorage` do navegador.

-   **📊 Estatísticas Detalhadas:** Acompanhe seu desempenho em cada modo de jogo através de um modal de estatísticas.

-   **🔔 Notificações (Toasts):** Receba mensagens animadas sobre ações do jogo, como "Palavra inválida" ou resultados de vitória/derrota.

---

## 🎮 Como Jogar

1.  **Objetivo:** Adivinhar a palavra secreta de cinco letras.
2.  **Digite um Palpite:** Use seu teclado físico ou o teclado virtual na tela.
3.  **Submeta:** Pressione `Enter`. Apenas palavras válidas são aceitas.
4.  **Analise as Dicas:** As cores das letras no tabuleiro e no teclado indicarão o quão perto você está da resposta.
5.  **Continue Tentando:** Você tem até 5 tentativas para adivinhar a palavra.

---

## 🛠️ Tecnologias Utilizadas

-   [TypeScript](https://www.typescriptlang.org/): Garante um código mais seguro e manutenível através da tipagem estática.
-   [Vite](https://vitejs.dev/): Ferramenta de build moderna que oferece um ambiente de desenvolvimento extremamente rápido e otimizado.
-   [Tailwind CSS](https://tailwindcss.com/): Framework CSS utility-first para a criação de designs customizados de forma rápida e eficiente.
-   HTML5

---

## 📂 Estrutura do Projeto

```markdown
📁 src/
│
├── 📁 components/
│   ├── 📄 board.ts         # Lógica para criar, renderizar e atualizar o tabuleiro do jogo.
│   ├── 📄 keyboard.ts      # Lida com a criação do teclado virtual e seus eventos.
│   ├── 📄 style.css        # Estilos globais e customizações com Tailwind CSS.
│   └── 📄 toast.ts         # Módulo para exibir notificações (toasts) para o usuário.
│
├── 📁 game/
│   ├── 📄 game.ts          # Contém a lógica central de validação e avaliação de tentativas.
│   ├── 📄 gameState.ts     # Gerencia todo o estado do jogo, estatísticas e salvamento no localStorage.
│   └── 📄 words.ts         # Armazena as listas de palavras e seleciona a palavra do dia ou aleatória.
│
├── 📄 main.ts              # Ponto de entrada da aplicação, inicializa o jogo e os componentes.
├── 📄 eventBus.ts          # Um simples barramento de eventos para comunicação desacoplada entre módulos.
└── 📄 types.ts             # Definições de tipos e constantes globais do TypeScript.
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

## URL do site

https://letr-az.vercel.app

---

## ✨ Contribuições

Sinta-se à vontade para abrir *issues* ou enviar *pull requests* com melhorias, correções ou novas funcionalidades! 🚀
