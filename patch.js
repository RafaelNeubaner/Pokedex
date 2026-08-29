const fs = require('fs');
let content = fs.readFileSync('js/scripts.js', 'utf8');

// 1. Fix resetPokedex to clear pokemonGif
content = content.replace(
  /const pokemonSpecies = document\.querySelectorAll\('\.PokemonSpecies'\);/g,
  "const pokemonSpecies = document.querySelectorAll('.PokemonSpecies');\n  const pokemonGif = document.getElementById('PokemonGif');"
);
content = content.replace(
  /if \(pokemonNumber\) pokemonNumber\.innerHTML = '';/g,
  "if (pokemonNumber) pokemonNumber.innerHTML = '';\n  if (pokemonGif) pokemonGif.src = '';"
);

// 2. Add loading to pokeMoves
content = content.replace(
  /movesList\.innerHTML = '';([\s\S]*?)for \(let i = 0; i < Math\.min\(pokemon\.moves\.length, 10\); i\+\+\) \{/,
  `movesList.innerHTML = '';
    const visorReset = document.querySelector('.visorDireito.reset');
    const visorResetText = visorReset?.querySelector('.textCenter');
    if (visorReset) {
      visorReset.classList.remove('hidden');
      if (visorResetText) visorResetText.innerHTML = '<img src="/assets/media/images/pikachu.gif" alt="Loading..." style="height: 100px; object-fit: contain;" />';
    }
    infoSection.classList.add('hidden');
    statsSection.classList.add('hidden');
    movesSection.classList.add('hidden');
    evosSection.classList.add('hidden');
    for (let i = 0; i < Math.min(pokemon.moves.length, 10); i++) {`
);

content = content.replace(
  /infoSection\.classList\.add\('hidden'\);\n\s*statsSection\.classList\.add\('hidden'\);\n\s*movesSection\.classList\.remove\('hidden'\);\n\s*evosSection\.classList\.add\('hidden'\);/g,
  `if (visorReset) {
      visorReset.classList.add('hidden');
      if (visorResetText) visorResetText.textContent = 'Select a Pokémon';
    }
    infoSection.classList.add('hidden');
    statsSection.classList.add('hidden');
    movesSection.classList.remove('hidden');
    evosSection.classList.add('hidden');`
);

// 3. Add loading to pokeEvos
content = content.replace(
  /evosList\.innerHTML = '';\n\s*let url = pokemon\.species\.url;/g,
  `evosList.innerHTML = '';
    const visorReset = document.querySelector('.visorDireito.reset');
    const visorResetText = visorReset?.querySelector('.textCenter');
    if (visorReset) {
      visorReset.classList.remove('hidden');
      if (visorResetText) visorResetText.innerHTML = '<img src="/assets/media/images/pikachu.gif" alt="Loading..." style="height: 100px; object-fit: contain;" />';
    }
    infoSection.classList.add('hidden');
    statsSection.classList.add('hidden');
    movesSection.classList.add('hidden');
    evosSection.classList.add('hidden');
    let url = pokemon.species.url;`
);

// We need to fix the two places in pokeEvos where it removes hidden from evosSection
// Luckily they match the same block as pokeMoves, but with evosSection.classList.remove('hidden');
content = content.replace(
  /infoSection\.classList\.add\('hidden'\);\n\s*statsSection\.classList\.add\('hidden'\);\n\s*movesSection\.classList\.add\('hidden'\);\n\s*evosSection\.classList\.remove\('hidden'\);/g,
  `if (visorReset) {
        visorReset.classList.add('hidden');
        if (visorResetText) visorResetText.textContent = 'Select a Pokémon';
      }
      infoSection.classList.add('hidden');
      statsSection.classList.add('hidden');
      movesSection.classList.add('hidden');
      evosSection.classList.remove('hidden');`
);

// 4. Add loading to loadHomePage
const loadHomePagePattern = /const loadHomePage = async \(offset = 0, limit = 6, initialSelectedIndex = 0\) => \{[\s\S]*?console\.error\('Error loading home page:', error\);\n  \}\n\};/g;

const newLoadHomePage = `const loadHomePage = async (offset = 0, limit = 6, initialSelectedIndex = 0) => {
  const homeContainer = document.querySelector('.home');
  if (!homeContainer) return;
  
  // Show loading pokemon GIF alone
  homeContainer.innerHTML = '<div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; grid-column: 1 / -1; grid-row: 1 / -1;"><img src="/assets/media/images/pikachu.gif" alt="Loading..." style="height: 100px; object-fit: contain;" /></div>';
  
  try {
    const response = await fetch(\`https://pokeapi.co/api/v2/pokemon?offset=\${offset}&limit=\${limit}\`);
    if (!response.ok) return;
    const data = await response.json();
    const pokemonList = data.results || [];
    const cards = [];
    
    for (let index = 0; index < pokemonList.length; index++) {
      const pokemon = pokemonList[index];
      const pokemonData = await fetchPokemonData(pokemon.name);
      if (!pokemonData) {
        continue;
      }

      const pokemonCard = document.createElement('article');
      pokemonCard.classList.add('pokeCard', 'cyberCard');
      pokemonCard.innerHTML = \`
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/\${pokemonData.id}.png" alt="\${pokemonData.name}" class="cardImage">
                <p class="cardName neonText">\${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}</p>
            \`;
      const defaultImage = \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/\${pokemonData.id}.png\`;
      const hoverImage = \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/\${pokemonData.id}.gif\`;
      const canAnimate = pokemonData.id <= 649;

      pokemonCard.dataset.defaultImage = defaultImage;
      pokemonCard.dataset.hoverImage = hoverImage;
      pokemonCard.dataset.canAnimate = canAnimate;
      pokemonCard.dataset.cardIndex = index;

      pokemonCard.addEventListener('click', () => {
        pokeInfo(pokemonData);
        if (homeSection) homeSection.classList.add('hidden');
      });

      pokemonCard.addEventListener('mouseenter', () => {
        updateSelectedCard(index);
      });

      pokemonCard.addEventListener('mouseleave', () => {
        updateSelectedCard(selectedCardIndex);
      });

      if (index === initialSelectedIndex) {
        setCardHoveredState(pokemonCard, true);
        selectedCardIndex = index;
      } else {
        setCardHoveredState(pokemonCard, false);
      }
      
      cards.push(pokemonCard);
    }

    // Hide loading GIF and show the 6 pokemons
    homeContainer.innerHTML = '';
    cards.forEach(card => homeContainer.appendChild(card));
    updateSelectedCard(initialSelectedIndex);
  } catch (error) {
    console.error('Error loading home page:', error);
    homeContainer.innerHTML = '<p class="textCenter alignCenter" style="color: white; grid-column: 1 / -1;">Error loading data.</p>';
  }
};`;

content = content.replace(loadHomePagePattern, newLoadHomePage);

fs.writeFileSync('js/scripts.js', content, 'utf8');
