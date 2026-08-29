const infosButton = document.querySelectorAll('.navItem.info');
const statsButton = document.querySelectorAll('.navItem.stats');
const movesButton = document.querySelectorAll('.navItem.moves');
const evosButton = document.querySelectorAll('.navItem.evos');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');
const centerButton = document.getElementById('centerButton');
const okButton = document.getElementById('okButton');
const backButton = document.getElementById('backButton');
const muteButton = document.getElementById('muteButton');
const searchInput = document.getElementById('searchInput');
const infoSection = document.querySelector('.PokeInfo');
const statsSection = document.querySelector('.pokeStats');
const movesSection = document.querySelector('.pokeMoves');
const evosSection = document.querySelector('.pokeEvos');
const homeSection = document.querySelector('.home');

// Audio control
let isMuted = false;
// Pagination control
let selectedCardIndex = 0;
let currentOffset = 0;

// Function to fetch Pokemon data from PokeAPI
const fetchPokemonData = async (pokemon) => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`);
    if (!response.ok) {
      throw new Error('Pokemon not found');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    alert('Pokemon not found. Please try again.');
  }
};

// Footer buttons
infosButton.forEach(button => {
  button.addEventListener('click', async () => {
    let pokemonName = document.querySelector('.PokemonSpecies')?.textContent;
    if (pokemonName) {
      const pokemon = await fetchPokemonData(pokemonName);
      pokeInfo(pokemon);
    }
  });
});

statsButton.forEach(button => {
  button.addEventListener('click', async () => {
    let pokemonName = document.querySelector('.PokemonSpecies')?.textContent;
    if (pokemonName) {
      const pokemon = await fetchPokemonData(pokemonName);
      pokeStats(pokemon);
    }
  });
});

movesButton.forEach(button => {
  button.addEventListener('click', async () => {
    let pokemonName = document.querySelector('.PokemonSpecies')?.textContent;
    if (pokemonName) {
      const pokemon = await fetchPokemonData(pokemonName);
      pokeMoves(pokemon);
    }
  });
});

evosButton.forEach(button => {
  button.addEventListener('click', async () => {
    let pokemonName = document.querySelector('.PokemonSpecies')?.textContent;
    if (pokemonName) {
      const pokemon = await fetchPokemonData(pokemonName);
      pokeEvos(pokemon);
    }
  });
});

const maxOffset = 649;
const limit = 6;

const getHomeCards = () => Array.from(document.querySelectorAll('.home .pokeCard'));

// Apply hovered class to card
const setCardHoveredState = (card, isHovered) => {
  const cardImage = card.querySelector('.cardImage');
  const defaultImage = card.dataset.defaultImage;
  const hoverImage = card.dataset.hoverImage;
  const canAnimate = card.dataset.canAnimate === 'true';

  if (isHovered) {
    card.classList.add('hovered');
    if (canAnimate && hoverImage && cardImage) {
      cardImage.src = hoverImage;
    }
    return;
  }

  card.classList.remove('hovered');
  if (defaultImage && cardImage) {
    cardImage.src = defaultImage;
  }
};

const updateSelectedCard = (newIndex) => {
  const cards = getHomeCards();
  if (cards.length === 0) {
    selectedCardIndex = 0;
    return;
  }

  const safeIndex = Math.max(0, Math.min(newIndex, cards.length - 1));
  cards.forEach((card, index) => setCardHoveredState(card, index === safeIndex));
  selectedCardIndex = safeIndex;
};

const isHomeVisible = () => homeSection ? !homeSection.classList.contains('hidden') : false;

const goToPage = async (newOffset, selectedIndex) => {
  if (newOffset < 0 || newOffset > maxOffset) {
    return false;
  }

  currentOffset = newOffset;
  await loadHomePage(currentOffset, limit, selectedIndex);
  return true;
};

// D-pad movement functions
const moveSelectionRight = async () => {
  const cards = getHomeCards();
  if (cards.length === 0) {
    return;
  }

  if (selectedCardIndex < cards.length - 1) {
    updateSelectedCard(selectedCardIndex + 1);
    return;
  }

  await goToPage(currentOffset + limit, 0);
};

const moveSelectionLeft = async () => {
  if (selectedCardIndex > 0) {
    updateSelectedCard(selectedCardIndex - 1);
    return;
  }

  const moved = await goToPage(currentOffset - limit, limit - 1);
  if (moved) {
    const cards = getHomeCards();
    updateSelectedCard(Math.min(limit - 1, cards.length - 1));
  }
};

const moveSelectionDown = async () => {
  const cards = getHomeCards();
  if (cards.length === 0) {
    return;
  }

  if (selectedCardIndex <= 2) {
    const nextIndex = selectedCardIndex + 3;
    if (nextIndex < cards.length) {
      updateSelectedCard(nextIndex);
      return;
    }
  }

  const targetColumn = selectedCardIndex % 3;
  await goToPage(currentOffset + limit, targetColumn);
};

const moveSelectionUp = async () => {
  if (selectedCardIndex >= 3) {
    updateSelectedCard(selectedCardIndex - 3);
    return;
  }

  const targetColumn = selectedCardIndex;
  const moved = await goToPage(currentOffset - limit, targetColumn + 3);
  if (moved) {
    const cards = getHomeCards();
    updateSelectedCard(Math.min(targetColumn + 3, cards.length - 1));
  }
};

const activateSelectedCard = () => {
  const cards = getHomeCards();
  if (cards.length === 0) {
    return;
  }

  const selectedCard = cards[selectedCardIndex];
  if (selectedCard) {
    selectedCard.click();
  }
};

// D-pad button listeners
if (leftButton) {
  leftButton.addEventListener('click', async () => {
    if (isHomeVisible()) {
      await moveSelectionLeft();
    } else {
      await proxPokemon(-1);
    }
  });
}

if (rightButton) {
  rightButton.addEventListener('click', async () => {
    if (!isHomeVisible()) {
      await proxPokemon(1);
    }
    await moveSelectionRight();
  });
}

if (upButton) {
  upButton.addEventListener('click', async () => {
    if (!isHomeVisible()) {
      await proxPokemon(-3);
    }
    await moveSelectionUp();
  });
}

if (downButton) {
  downButton.addEventListener('click', async () => {
    if (!isHomeVisible()) {
      await proxPokemon(3);
    }
    await moveSelectionDown();
  });
}

if (centerButton) {
  centerButton.addEventListener('click', () => {
    if (!isHomeVisible()) {
      return;
    }
    activateSelectedCard();
  });
}

// Search Pokemon when clicking ok button or pressing Enter
const buscarPokemon = async () => {
  if (!searchInput) return;
  const pokemonName = searchInput.value.trim();
  if (pokemonName) {
    const pokemon = await fetchPokemonData(pokemonName);
    if (pokemon) {
      pokeInfo(pokemon);
      searchInput.value = '';
      if (homeSection) homeSection.classList.add('hidden');
    }
  } else {
    alert('Please enter a Pokemon name.');
  }
};

const proxPokemon = async (offset) => {
  const numElem = document.querySelector('.PokemonNumber');
  if (!numElem) return;
  const pokemonNumber = numElem.textContent;
  const pokemonNumberInt = parseInt(pokemonNumber.replace('#', ''));
  const query = (pokemonNumberInt + offset).toString();
  if (query <= 1025 && query > 0) {
    const pokemon = await fetchPokemonData(query);
    pokeInfo(pokemon);
  }
};

// OK button click
if (okButton) {
  okButton.addEventListener('click', buscarPokemon);
}

// Mute button click
if (muteButton) {
  muteButton.addEventListener('click', () => {
    isMuted = !isMuted;
    muteButton.textContent = isMuted ? '🔇' : '🔊';
    muteButton.style.opacity = isMuted ? '0.5' : '1';
  });
}

// Press Enter in search input
if (searchInput) {
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      buscarPokemon();
    }
  });
}

// Reset Pokedex to initial state
const resetPokedex = () => {
  const pokemonName = document.getElementById('PokemonName');
  const pokemonNumber = document.getElementById('PokemonNumber');
  const pokemonSpecies = document.querySelectorAll('.PokemonSpecies');
  const pokemonGif = document.getElementById('PokemonGif');
  if (pokemonName) pokemonName.innerHTML = '';
  if (pokemonNumber) pokemonNumber.innerHTML = '';
  if (pokemonGif) pokemonGif.src = '';
  pokemonSpecies.forEach(el => { el.textContent = ''; });

  if (infoSection) infoSection.classList.add('hidden');
  if (statsSection) statsSection.classList.add('hidden');
  if (movesSection) movesSection.classList.add('hidden');
  if (evosSection) evosSection.classList.add('hidden');
  if (homeSection) homeSection.classList.remove('hidden');

  const visorReset = document.querySelector('.visorDireito.reset');
  const visorResetText = visorReset?.querySelector('.textCenter');
  if (visorReset) visorReset.classList.remove('hidden');
  if (visorResetText) visorResetText.textContent = 'Select a Pokémon';
};

if (backButton) {
  backButton.addEventListener('click', resetPokedex);
}

// Load and display information for the selected Pokemon
async function pokeInfo(pokemon) {
  if (!infoSection || !statsSection || !movesSection || !evosSection) {
    console.error('One or more info sections were not found in the DOM.');
    return;
  }

  const visorReset = document.querySelector('.visorDireito.reset');
  const visorResetText = visorReset?.querySelector('.textCenter');

  if (pokemon && pokemon.name) {
    if (visorReset) {
      visorReset.classList.remove('hidden');
      if (visorResetText) visorResetText.textContent = 'Loading...';
    }
    infoSection.classList.add('hidden');
    statsSection.classList.add('hidden');
    movesSection.classList.add('hidden');
    evosSection.classList.add('hidden');

    playPokemonSound(pokemon.id);

    const nameElem = document.getElementById('PokemonName');
    const numElem = document.getElementById('PokemonNumber');
    const gifElem = document.getElementById('PokemonGif');
    const speciesElem = document.getElementsByClassName('PokemonSpecies')[0];
    const sideNumElem = document.getElementsByClassName('PokemonNumber')[0];

    if (nameElem) nameElem.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    if (numElem) numElem.textContent = `#${pokemon.id.toString().padStart(4, '0')}`;
    if (gifElem) {
      if (pokemon.id <= 649) {
        gifElem.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`;
      } else {
        gifElem.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
      }
    }
    if (speciesElem) speciesElem.textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    if (sideNumElem) sideNumElem.textContent = `#${pokemon.id}`;

    const typeContainer = document.querySelector('.typeContainer');
    const weaknessContainer = document.querySelector('.weaknessContainer');
    const effectivenessContainer = document.querySelector('.effectivenessContainer');
    if (typeContainer) typeContainer.innerHTML = '';
    if (effectivenessContainer) effectivenessContainer.innerHTML = '';
    if (weaknessContainer) weaknessContainer.innerHTML = '';

    if (pokemon.types && pokemon.types.length > 0) {
      const typeIcon = document.createElement('img');
      typeIcon.classList.add('typeIcon');
      let url = pokemon.types[0].type.url;
      let temp = await fetch(url);
      let typeData = await temp.json();
      if (typeData.sprites?.['generation-viii']?.['brilliant-diamond-shining-pearl']?.name_icon) {
        typeIcon.src = typeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
        if (typeContainer) typeContainer.appendChild(typeIcon);
      }

      if (typeData.damage_relations?.double_damage_from) {
        typeData.damage_relations.double_damage_from.forEach(async (type) => {
          const typeIcon = document.createElement('img');
          typeIcon.classList.add('typeIcon');
          let url = type.url;
          let temp = await fetch(url);
          let subTypeData = await temp.json();
          if (subTypeData.sprites?.['generation-viii']?.['brilliant-diamond-shining-pearl']?.name_icon) {
            typeIcon.src = subTypeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
            if (weaknessContainer) weaknessContainer.appendChild(typeIcon);
          }
        });
      }

      if (typeData.damage_relations?.double_damage_to) {
        typeData.damage_relations.double_damage_to.forEach(async (type) => {
          const typeIcon = document.createElement('img');
          typeIcon.classList.add('typeIcon');
          let url = type.url;
          let temp = await fetch(url);
          let subTypeData = await temp.json();
          if (subTypeData.sprites?.['generation-viii']?.['brilliant-diamond-shining-pearl']?.name_icon) {
            typeIcon.src = subTypeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
            if (effectivenessContainer) effectivenessContainer.appendChild(typeIcon);
          }
        });
      }

      if (pokemon.types.length > 1) {
        url = pokemon.types[1].type.url;
        temp = await fetch(url);
        let secondTypeData = await temp.json();
        if (secondTypeData.sprites?.['generation-viii']?.['brilliant-diamond-shining-pearl']?.name_icon) {
          const secondTypeIcon = document.createElement('img');
          secondTypeIcon.classList.add('typeIcon');
          secondTypeIcon.src = secondTypeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
          if (typeContainer) typeContainer.appendChild(secondTypeIcon);
        }
      }
    }

    if (pokemon.species?.url) {
      let url = pokemon.species.url;
      let temp = await fetch(url);
      const speciesData = await temp.json();
      const generaEntry = speciesData.genera?.find(entry => entry.language.name === 'en');
      const genus = generaEntry ? generaEntry.genus.replace(/[\f\n\r]/g, ' ') : 'No genus available.';

      const flavorTextEntry = speciesData.flavor_text_entries?.find(entry => entry.language.name === 'en');
      const flavorText = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/[\f\n\r]/g, ' ') : 'No description available.';

      const genElem = document.getElementsByClassName('genera')[0];
      const descElem = document.getElementsByClassName('description')[0];
      const altElem = document.getElementsByClassName('altura')[0];
      const pesoElem = document.getElementsByClassName('peso')[0];

      if (genElem) genElem.textContent = genus;
      if (descElem) descElem.textContent = flavorText;
      if (altElem) altElem.textContent = ` ${pokemon.height / 10} m`;
      if (pesoElem) pesoElem.textContent = ` ${pokemon.weight / 10} kg`;
    }

    if (visorReset) {
      visorReset.classList.add('hidden');
      if (visorResetText) visorResetText.textContent = 'Select a Pokémon';
    }
    infoSection.classList.remove('hidden');
    statsSection.classList.add('hidden');
    movesSection.classList.add('hidden');
    evosSection.classList.add('hidden');
  } else {
    alert('Please enter a Pokemon name.');
  }
}

// Load and display stats for the selected Pokemon
async function pokeStats(pokemon) {
  if (pokemon && pokemon.stats) {
    const stats = pokemon.stats;
    const progressBars = document.querySelectorAll('.progressBar');
    const statValues = document.querySelectorAll('.statValue');

    if (progressBars.length >= 6) {
      progressBars[0].style.width = `${(stats[0].base_stat / 255) * 100}%`;
      progressBars[1].style.width = `${(stats[1].base_stat / 190) * 100}%`;
      progressBars[2].style.width = `${(stats[2].base_stat / 250) * 100}%`;
      progressBars[3].style.width = `${(stats[3].base_stat / 194) * 100}%`;
      progressBars[4].style.width = `${(stats[4].base_stat / 250) * 100}%`;
      progressBars[5].style.width = `${(stats[5].base_stat / 200) * 100}%`;
    }

    if (statValues.length >= 6) {
      statValues[0].textContent = stats[0].base_stat;
      statValues[1].textContent = stats[1].base_stat;
      statValues[2].textContent = stats[2].base_stat;
      statValues[3].textContent = stats[3].base_stat;
      statValues[4].textContent = stats[4].base_stat;
      statValues[5].textContent = stats[5].base_stat;
    }

    infoSection.classList.add('hidden');
    statsSection.classList.remove('hidden');
    movesSection.classList.add('hidden');
    evosSection.classList.add('hidden');
  } else {
    alert('Please enter a Pokemon name.');
  }
}

// Load and display the first 10 moves of the selected Pokemon
async function pokeMoves(pokemon) {
  if (pokemon && pokemon.moves) {
    const movesList = document.querySelector('.moveList');
    if (!movesList) return;
    movesList.innerHTML = '';
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
    for (let i = 0; i < Math.min(pokemon.moves.length, 10); i++) {
      let url = pokemon.moves[i].move.url;
      let temp = await fetch(url);
      let moveData = await temp.json();
      let typeUrl = moveData.type?.url;
      let typeIconSrc = '';
      if (typeUrl) {
        temp = await fetch(typeUrl);
        let typeData = await temp.json();
        typeIconSrc = typeData.sprites?.['generation-viii']?.['brilliant-diamond-shining-pearl']?.name_icon || '';
      }
      let moveName = moveData.names?.find(name => name.language.name === 'en')?.name || (moveData.name ? moveData.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown');
      let moveDesc = moveData.flavor_text_entries?.find(entry => entry.language.name === 'en')?.flavor_text.replace(/[\f\n\r]/g, ' ') || 'No description available.';

      movesList.innerHTML += `<li class="moveItem card glow">
                <div class="moveTitle">
                  <p>${moveName}</p>
                  <span class="moveType">
                    <img
                      src="${typeIconSrc}"
                      alt="attack type"
                      class="typeIcon"
                    />
                  </span>
                </div>
                <div class="moveDesc">
                  <p class="moveDescription">
                    ${moveDesc}
                  </p>
                </div>
                <div class="moveStats">
                  <p class="power">Power: ${moveData.power || 'N/A'}</p>
                  <p class="acuracy">Acc: ${moveData.accuracy ? `${moveData.accuracy}%` : 'N/A'}</p>
                  <p class="pp">PP: ${moveData.pp || 'N/A'}</p>
                </div>
              </li>`;
    }

    if (visorReset) {
      visorReset.classList.add('hidden');
      if (visorResetText) visorResetText.textContent = 'Select a Pokémon';
    }
    infoSection.classList.add('hidden');
    statsSection.classList.add('hidden');
    movesSection.classList.remove('hidden');
    evosSection.classList.add('hidden');
  } else {
    alert('Please enter a Pokemon name.');
  }
}

// Load and display direct evolutions of the selected Pokemon
async function pokeEvos(pokemon) {
  if (pokemon && pokemon.species) {
    const evosList = document.querySelector('.evoList');
    if (!evosList) return;
    evosList.innerHTML = '';
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
    let url = pokemon.species.url;
    let temp = await fetch(url);
    let speciesData = await temp.json();
    if (speciesData.evolution_chain) {
      url = speciesData.evolution_chain.url;
      temp = await fetch(url);
      let evoData = await temp.json();
      const evoChain = [];

      const collectEvolutions = (node) => {
        if (!node) {
          return;
        }

        if (node.species?.name === pokemon.name) {
          evoChain.push(...(node.evolves_to || []));
          return;
        }

        (node.evolves_to || []).forEach(child => collectEvolutions(child));
      };

      collectEvolutions(evoData.chain);
      evosList.innerHTML = '';
      if (evoChain.length === 0) {
        evosList.innerHTML = '<p>No evolutions available.</p>';
      } else {
        for (const evo of evoChain) {
          const name = evo.species?.name;
          if (!name) continue;
          const evoData = await fetchPokemonData(name);
          if (!evoData) continue;
          const details = evo.evolution_details?.[0];
          const triggerName = details?.trigger?.name;
          const evoFormattedName = name.charAt(0).toUpperCase() + name.slice(1);
          const evoImg = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoData.id}.png`;

          if (triggerName === 'level-up') {
            if (details?.min_level) {
              evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evoFormattedName} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="${evoImg}"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requires Level Up</p>
                <p class="evoDetails">Level: ${details.min_level}</p>
              </div>
            </article>
            </li>`;
            } else if (details?.location_name && !details?.min_happiness) {
              evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evoFormattedName} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="${evoImg}"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requires Level Up</p>
                <p class="evoDetails">Level: ${details.min_level || 'N/A'}</p>
              </div>
            </article>
            </li>`;
            } else if (details?.min_happiness && details?.location_name && !details?.time_of_day) {
              evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evoFormattedName} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="${evoImg}"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requires Level Up</p>
                <p class="evoDetails">Level: ${details.min_level || 'N/A'}</p>
              </div>
            </article>
            </li>`;
            } else {
              evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evoFormattedName} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="${evoImg}"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requires Friendship</p>
                <p class="evoDetails">Min Happiness: ${details?.min_happiness || 'N/A'}</p>
              </div>
            </article>
            </li>`;
            }
          } else if (triggerName === 'use-item') {
            evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evoFormattedName} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="${evoImg}"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requires Item</p>
                <p class="evoDetails">Requires ${details?.item?.name ? details.item.name.replace(/-/g, ' ') : 'Item'}</p>
              </div>
            </article>
            </li>`;
          } else if (triggerName === 'trade' && details?.held_item) {
            evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evoFormattedName} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="${evoImg}"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requires Trade</p>
                <p class="evoDetails">Needs to hold ${details.held_item.name ? details.held_item.name.replace(/-/g, ' ') : 'Item'}</p>
              </div>
            </article>
            </li>`;
          } else if (triggerName === 'trade') {
            evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evoFormattedName} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="${evoImg}"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requires Trade</p>
                <p class="evoDetails"></p>
              </div>
            </article>
            </li>`;
          } else {
            evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evoFormattedName} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="${evoImg}"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle"></p>
                <p class="evoDetails"></p>
              </div>
            </article>
            </li>`;
          }
        }
      }

      if (visorReset) {
        visorReset.classList.add('hidden');
        if (visorResetText) visorResetText.textContent = 'Select a Pokémon';
      }
      infoSection.classList.add('hidden');
      statsSection.classList.add('hidden');
      movesSection.classList.add('hidden');
      evosSection.classList.remove('hidden');
    }
  } else {
    alert('Please enter a Pokemon name.');
  }
}

// Function to play Pokemon sound
const playPokemonSound = (pokemonId) => {
  if (typeof Audio === 'undefined' || isMuted) return;

  try {
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`;
    const audio = new Audio(cryUrl);
    audio.play().catch(error => {
      console.log('Sound not available for this Pokemon:', error);
    });
  } catch (error) {
    console.error('Error trying to play sound:', error);
  }
};

// Populate home with Pokemon cards
const loadHomePage = async (offset = 0, limit = 6, initialSelectedIndex = 0) => {
  const homeContainer = document.querySelector('.home');
  if (!homeContainer) return;
  
  // Show loading pokemon GIF alone
  homeContainer.innerHTML = '<div style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; grid-column: 1 / -1; grid-row: 1 / -1;"><img src="/assets/media/images/pikachu.gif" alt="Loading..." style="height: 100px; object-fit: contain;" /></div>';
  
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
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
      pokemonCard.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png" alt="${pokemonData.name}" class="cardImage">
                <p class="cardName neonText">${pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}</p>
            `;
      const defaultImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonData.id}.png`;
      const hoverImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonData.id}.gif`;
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
};

// Initialize app and load the home page
const initApp = () => {
  loadHomePage();
};

initApp();