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

A estrutura de arquivos do `letrAZ` foi organizada para separar responsabilidades, facilitando a manutenção e escalabilidade.

```
📁 src/
│
├── 📄 main.ts           # Ponto de entrada: inicializa o jogo e registra os eventos.
├── 📄 game.ts           # Orquestrador principal: conecta a interface do usuário com a lógica do jogo.
├── 📄 config.ts         # Constantes globais (número de letras, tentativas, etc.).
├── 📄 types.ts          # Definições de tipos e interfaces (ex: LetterStatus, GameState).
│
├── 📁 components/       # Módulos que manipulam diretamente o DOM.
│   ├── 📄 board.ts      # Funções para criar, atualizar e colorir o tabuleiro.
│   ├── 📄 keyboard.ts   # Lógica do teclado virtual, incluindo atualização de cores das teclas.
│   └── 📄 toast.ts      # Exibição de notificações (ex: "Palavra inválida").
│
├── 📁 core/             # Núcleo da lógica de negócio do jogo.
│   ├── 📄 game-logic.ts # Contém as regras centrais (comparar palavras, definir status das letras).
│   ├── 📄 state.ts      # Gerencia o estado completo do jogo (tentativas, letras, etc.) e o salva no localStorage.
│   └── 📄 word-service.ts # Responsável por carregar a lista de palavras e selecionar a palavra do dia.
│
├── � utils/            # Funções utilitárias reutilizáveis.
│   └── 📄 date.ts       # Funções para lidar com datas, usado para a palavra do dia.
│
└── 📄 style.css         # Estilos base e configuração do Tailwind CSS.
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
