# Pokédex Cyberpunk

## 📖 Sobre o Projeto
Esta é uma aplicação web interativa de uma Pokédex, desenvolvida com HTML, CSS e JavaScript Vanilla. O projeto possui um design moderno com inspirações em cyberpunk e glassmorphism (efeito de vidro), e consome a [PokéAPI](https://pokeapi.co/) para exibir informações detalhadas e precisas sobre os Pokémon.

A interface foi projetada para simular o uso de uma Pokédex real, contando com botões direcionais (D-Pad), um visor principal (onde os Pokémon são listados em formato de grade) e um visor lateral (onde as estatísticas, movimentos e evoluções são exibidos).

## ✨ Funcionalidades
- **Navegação de Pokémon:** Visualize os Pokémon de forma paginada (6 cards por vez) no visor principal.
- **Busca por Nome ou Número:** Utilize a barra de pesquisa para encontrar um Pokémon específico rapidamente na base de dados.
- **Detalhes Completos do Pokémon:**
  - **Info:** Tipo, fraquezas, vantagens (com base no tipo), gênero, altura, peso e descrição narrativa.
  - **Stats:** Gráficos de barra exibindo as estatísticas base do Pokémon (HP, Attack, Defense, Sp. Atk, Sp. Def e Speed).
  - **Moves:** Lista detalhada dos golpes que o Pokémon aprende, exibindo o nome, tipo do golpe, poder (power) e precisão (accuracy).
  - **Evolutions:** Cadeia evolutiva completa do Pokémon, mostrando dinamicamente as condições para cada evolução acontecer (passar de nível, amizade, usar pedra evolutiva, trocar de Pokémon, etc.).
- **Gritos (Cries):** A Pokédex reproduz automaticamente o som original (cry) de cada Pokémon ao selecioná-lo. Há um botão exclusivo para mutar/desmutar a aplicação.
- **Controles Interativos (D-Pad):** Navegue pelos cards da interface e entre nas páginas adjacentes simulando toques nas setas do controle da tela.
- **Animações e Loading:** Sprites clássicos e animados dos Pokémon (até a Geração V) ao focar nos cards. O sistema conta com uma tela de carregamento customizada (Pikachu correndo) nas transições de páginas e durante a busca de dados complexos para que a interface não trave.
- **Idioma:** Toda a interface (UI) e os dados trazidos pela API estão em **Inglês**, padronizando as nomenclaturas com a franquia original.

## 🛠️ Tecnologias Utilizadas
- **HTML5** (Semântica e estrutura de visores)
- **CSS3** (Variáveis CSS, CSS Grid, Flexbox, Animações, pseudo-elementos e Glassmorphism)
- **JavaScript (Vanilla)** (ES6+, DOM Manipulation, Async/Await)
- **[PokéAPI v2](https://pokeapi.co/)** (API RESTful gratuita e aberta para consumo de dados)

## 🚀 Como Executar o Projeto

Como o projeto é construído apenas com tecnologias web de front-end nativas, não há necessidade de configurações complexas de backend ou de instalar dependências pesadas (`node_modules`).

1. Clone o repositório ou baixe os arquivos da pasta do projeto.
2. Para evitar bloqueios de CORS (Cross-Origin Resource Sharing) no seu navegador, é recomendado rodar um servidor local simples.
   - **Extensão VS Code:** Instale a extensão "Live Server" e clique no botão "Go Live" estando no arquivo `index.html`.
   - **Via Node.js:** Rode `npx serve .` no terminal, na pasta raiz.
   - **Via Python:** Rode `python -m http.server 8000` (ou `python3 -m http.server`) no terminal, na pasta raiz.
3. Acesse `http://localhost:5500` (ou a porta exibida pelo seu servidor) no navegador.

## 🎮 Como Usar a Pokédex
- **D-Pad:** Use as setas do controle na interface para navegar entre os 6 Pokémon exibidos na tela principal. Empurrar a seleção para além das bordas avançará ou retornará a página.
- **Botão Central do D-Pad:** Pressione para "clicar" e abrir os detalhes do Pokémon que está selecionado.
- **Barra de Pesquisa:** Digite o nome de um Pokémon ou o número dele na National Dex e clique no botão **OK** (redondo, de cor cinza).
- **Botão Voltar (Vermelho):** Encontra-se acima do D-Pad. Pressione a qualquer momento para voltar à tela principal e limpar a pesquisa atual.
- **Botões do Visor Lateral (Infos, Stats, Moves, Evos):** Botões prateados ao redor da tela da direita. Alternam as abas de informações detalhadas do Pokémon.
- **Botão de Áudio:** Botão menor localizado próximo ao input de pesquisa. Liga ou desliga todos os sons emitidos pelos Pokémon.

## 📂 Estrutura de Arquivos Principal
- `index.html`: A fundação e layout dos visores da aplicação.
- `css/styles.css`: Estilização principal, lidando com responsividade básica, controles absolutos para se ajustar à imagem de fundo da Pokédex e luzes em neon.
- `js/scripts.js`: O "cérebro" da aplicação. Faz as requisições assíncronas `fetch` para a PokéAPI, formata as cadeias evolutivas e injeta os dados traduzidos dinamicamente no HTML.
- `assets/media/`: Contém as imagens fixas, a carcaça 2D da Pokédex, fundos de visores e o GIF do Pikachu usado na tela de carregamento.

