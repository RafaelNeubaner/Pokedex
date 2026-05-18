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

// Controle de áudio
let isMuted = false;
//controle de pagonação
let selectedCardIndex = 0;
// Traduções
let pokemon_flavor_texts = null;

//função para buscar os dados do pokemon na API
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
    alert('Pokémon não encontrado. Tente novamente.');
  }
}

//botoes do footer
infosButton.forEach(button => {
  button.addEventListener('click', async () => {
    let pokemonName = document.querySelector('.PokemonSpecies').textContent;
    const pokemon = await fetchPokemonData(pokemonName);
    pokeInfo(pokemon);
  });
});

statsButton.forEach(button => {
  button.addEventListener('click', async () => {
    let pokemonName = document.querySelector('.PokemonSpecies').textContent;
    const pokemon = await fetchPokemonData(pokemonName);
    pokeStats(pokemon);
  });
});

movesButton.forEach(button => {
  button.addEventListener('click', async () => {
    let pokemonName = document.querySelector('.PokemonSpecies').textContent;
    const pokemon = await fetchPokemonData(pokemonName);
    pokeMoves(pokemon);
  });
});

evosButton.forEach(button => {
  button.addEventListener('click', async () => {
    let pokemonName = document.querySelector('.PokemonSpecies').textContent;
    const pokemon = await fetchPokemonData(pokemonName);
    pokeEvos(pokemon);
  });
});

const maxOffset = 649;
const limit = 6;

const getHomeCards = () => Array.from(document.querySelectorAll('.home .pokeCard'));

//aplica a classe hovered no card
const setCardHoveredState = (card, isHovered) => {
  const cardImage = card.querySelector('.cardImage');
  const defaultImage = card.dataset.defaultImage;
  const hoverImage = card.dataset.hoverImage;
  const canAnimate = card.dataset.canAnimate === 'true';

  if (isHovered) {
    card.classList.add('hovered');
    if (canAnimate && hoverImage) {
      cardImage.src = hoverImage;
    }
    return;
  }

  card.classList.remove('hovered');
  if (defaultImage) {
    cardImage.src = defaultImage;
  }
};

const updateSelectedCard = (newIndex) => {
  const cards = getHomeCards();
  if (cards.length === 0) {
    selectedCardIndex = 0;
    return;
  }

  //prevenção de eerros
  const safeIndex = Math.max(0, Math.min(newIndex, cards.length - 1));
  cards.forEach((card, index) => setCardHoveredState(card, index === safeIndex));
  selectedCardIndex = safeIndex;
};

const isHomeVisible = () => !homeSection.classList.contains('hidden');

const goToPage = async (newOffset, selectedIndex) => {
  if (newOffset < 0 || newOffset > maxOffset) {
    return false;
  }

  currentOffset = newOffset;
  await loadHomePage(currentOffset, limit, selectedIndex);
  return true;
};

//funções que serão chamadas elo d-pad
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

//botoes d-pad
leftButton.addEventListener('click', async () => {
  if (isHomeVisible()) {
    await moveSelectionLeft();
  } else {
    await proxPokemon(-1);
  }
});

rightButton.addEventListener('click', async () => {
  if (!isHomeVisible()) {
    await proxPokemon(1);
  }
  await moveSelectionRight();
});

upButton.addEventListener('click', async () => {
  if (!isHomeVisible()) {
    await proxPokemon(-3);
  }
  await moveSelectionUp();
});

downButton.addEventListener('click', async () => {
  if (!isHomeVisible()) {
    await proxPokemon(3);
  }
  await moveSelectionDown();
});

centerButton.addEventListener('click', () => {
  if (!isHomeVisible()) {
    return;
  }
  activateSelectedCard();
});

//Função para fazer a busca quando clicar no botão de ok ou pressionar Enter
const buscarPokemon = async () => {
  const pokemonName = searchInput.value.trim();
  if (pokemonName) {
    const pokemon = await fetchPokemonData(pokemonName);
    if (pokemon) {
      pokeInfo(pokemon);
      searchInput.value = '';
      homeSection.classList.add('hidden');
    }
  } else {
    alert('Por favor, insira o nome de um Pokémon.');
  }
};

const proxPokemon = async (offset) => {
  const pokemonNumber = document.querySelector('.PokemonNumber').textContent;
  const pokemonNumberInt = parseInt(pokemonNumber.replace('#', ''));
  const query = (pokemonNumberInt + offset).toString();
  if (query <= 1025 && query > 0) {
    const pokemon = await fetchPokemonData(query);
    pokeInfo(pokemon);
  } else {
    return;
  }
}

//logica ao clicar no okbutton
okButton.addEventListener('click', buscarPokemon);

//logica ao clicar no botão de mute
muteButton.addEventListener('click', () => {
  isMuted = !isMuted;
  muteButton.textContent = isMuted ? '🔇' : '🔊';
  muteButton.style.opacity = isMuted ? '0.5' : '1';
});

//logica ao pressionar Enter no input de pesquisa
searchInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    buscarPokemon();
  }
});

//Função para resetar o Pokedex ao estado inicial
const resetPokedex = () => {
  // Limpar o input de pesquisa
  const pokemonName = document.getElementById('PokemonName');
  const pokemonNumber = document.getElementById('PokemonNumber');
  pokemonNumber.innerHTML = '';
  pokemonName.innerHTML = '';
  // esconder o visor direito e mostrar a tela inicial
  infoSection.classList.add('hidden');
  statsSection.classList.add('hidden');
  movesSection.classList.add('hidden');
  evosSection.classList.add('hidden');
  homeSection.classList.remove('hidden');

};

backButton.addEventListener('click', resetPokedex);

//função para carregar e exibir as informações do pokemon selecionado
async function pokeInfo(pokemon) {
  // contenção de erros
  if (!infoSection || !statsSection || !movesSection || !evosSection) {
    console.error('One or more info sections were not found in the DOM.');
    return;
  }

  if (pokemon && pokemon.name) {
    // Reproduzir som do Pokémon ao selecioná-lo
    playPokemonSound(pokemon.id);

    document.getElementById('PokemonName').textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    document.getElementById('PokemonNumber').textContent = `#${pokemon.id.toString().padStart(4, '0')}`;
    if (pokemon.id <= 649) {
      document.getElementById('PokemonGif').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`;
    } else {
      document.getElementById('PokemonGif').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    }
    document.getElementsByClassName('PokemonSpecies')[0].textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    document.getElementsByClassName('PokemonNumber')[0].textContent = `#${pokemon.id}`;

    // define os containers e limpa os ícones de tipo, fraqueza e eficácia anteriores
    const typeContainer = document.querySelector('.typeContainer');
    const weaknessContainer = document.querySelector('.weaknessContainer');
    const effectivenessContainer = document.querySelector('.effectivenessContainer');
    typeContainer.innerHTML = '';
    effectivenessContainer.innerHTML = '';
    weaknessContainer.innerHTML = '';

    // adiciona o ícone do tipo do Pokémon
    const typeIcon = document.createElement('img');
    typeIcon.classList.add('typeIcon');
    let url = pokemon.types[0].type.url;
    let temp = await fetch(url);
    let typeData = await temp.json();
    typeIcon.src = typeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
    typeContainer.appendChild(typeIcon);

    // adiciona os ícones dos tipos que são fracos contra o Pokémon
    typeData.damage_relations.double_damage_from.forEach(async (type) => {
      const typeIcon = document.createElement('img');
      typeIcon.classList.add('typeIcon');
      url = type.url;
      temp = await fetch(url);
      typeData = await temp.json();
      typeIcon.src = typeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
      weaknessContainer.appendChild(typeIcon);
    });

    // adiciona os ícones dos tipos que são eficazes contra o Pokémon
    typeData.damage_relations.double_damage_to.forEach(async (type) => {
      const typeIcon = document.createElement('img');
      typeIcon.classList.add('typeIcon');
      url = type.url;
      temp = await fetch(url);
      typeData = await temp.json();
      typeIcon.src = typeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
      effectivenessContainer.appendChild(typeIcon);
    }
    );

    //verifica se o pokemon tem mais de um tipo e repete o processo para o segundo tipo
    if (pokemon.types.length > 1) {
      url = pokemon.types[1].type.url;
      temp = await fetch(url);
      typeData = await temp.json();
      const typeIcon = document.createElement('img');
      typeIcon.classList.add('typeIcon');
      typeIcon.src = typeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
      document.querySelector('.typeContainer').appendChild(typeIcon);
    }

    //carrega o restante dos dados do pokemon
    url = pokemon.species.url;
    temp = await fetch(url);
    const speciesData = await temp.json();
    const generaEntry = speciesData.genera.find(entry => entry.language.name === 'en');
    if (generaEntry) {
      let enText = generaEntry.genus.replace(/[\f\n\r]/g, ' ');
      document.getElementsByClassName('description')[0].textContent = 'Traduzindo...';
      try {
        const res = await fetch(`/api/translate?text=${encodeURIComponent(enText)}`);
        const data = await res.json();
        generaEntry.genus = data.translated || enText;
      } catch (e) {
        generaEntry.genus = enText;
      }
    }
    let flavorText = 'Nenhuma descrição disponível.';
    if (pokemon_flavor_texts && pokemon_flavor_texts[pokemon.id]) {
        flavorText = pokemon_flavor_texts[pokemon.id].flavor_text;
    } else {
        const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        if (flavorTextEntry) {
            let enText = flavorTextEntry.flavor_text.replace(/[\f\n\r]/g, ' ');
            document.getElementsByClassName('description')[0].textContent = 'Traduzindo...';
            try {
                const res = await fetch(`/api/translate?text=${encodeURIComponent(enText)}`);
                const data = await res.json();
                flavorText = data.translated || enText;
            } catch (e) {
                flavorText = enText;
            }
        }
    }

    document.getElementsByClassName('genera')[0].textContent = generaEntry ? generaEntry.genus : 'Categoria não disponível.';
    document.getElementsByClassName('description')[0].textContent = flavorText;
    document.getElementsByClassName('altura')[0].textContent = ` ${pokemon.height / 10} m`;
    document.getElementsByClassName('peso')[0].textContent = ` ${pokemon.weight / 10} kg`;
    infoSection.classList.remove('hidden');
    statsSection.classList.add('hidden');
    movesSection.classList.add('hidden');
    evosSection.classList.add('hidden');
  }
  else {
    alert('Por favor, insira o nome de um Pokémon.');
  }
}

//função para carregar e exibir as stats do pokemon selecionado
async function pokeStats(pokemon) {
  if (pokemon && pokemon.stats) {
    const stats = pokemon.stats;
    document.querySelectorAll('.progressBar')[0].style.width = `${(stats[0].base_stat / 255) * 100}%`;
    document.querySelectorAll('.progressBar')[1].style.width = `${(stats[1].base_stat / 190) * 100}%`;
    document.querySelectorAll('.progressBar')[2].style.width = `${(stats[2].base_stat / 250) * 100}%`;
    document.querySelectorAll('.progressBar')[3].style.width = `${(stats[3].base_stat / 194) * 100}%`;
    document.querySelectorAll('.progressBar')[4].style.width = `${(stats[4].base_stat / 250) * 100}%`;
    document.querySelectorAll('.progressBar')[5].style.width = `${(stats[5].base_stat / 200) * 100}%`;
    document.querySelectorAll('.statValue')[0].textContent = stats[0].base_stat;
    document.querySelectorAll('.statValue')[1].textContent = stats[1].base_stat;
    document.querySelectorAll('.statValue')[2].textContent = stats[2].base_stat;
    document.querySelectorAll('.statValue')[3].textContent = stats[3].base_stat;
    document.querySelectorAll('.statValue')[4].textContent = stats[4].base_stat;
    document.querySelectorAll('.statValue')[5].textContent = stats[5].base_stat;
    infoSection.classList.add('hidden');
    statsSection.classList.remove('hidden');
    movesSection.classList.add('hidden');
    evosSection.classList.add('hidden');
  }
  else {
    alert('Por favor, insira o nome de um Pokémon.');
  }
}

//função para carregar e exibir os 10 primeiros movimentos do pokemon selecionado
async function pokeMoves(pokemon) {
  if (pokemon && pokemon.moves) {
    const movesList = document.querySelector('.moveList');
    movesList.innerHTML = '';
    for (let i = 0; i < Math.min(pokemon.moves.length, 10); i++) {
      let url = pokemon.moves[i].move.url;
      let temp = await fetch(url);
      let moveData = await temp.json();
      let typeUrl = moveData.type.url;
      temp = await fetch(typeUrl);
      let typeData = await temp.json();
      
      let enDesc = moveData.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text.replace(/[\f\n\r]/g, ' ') || '';
      let displayDesc = enDesc ? 'Traduzindo...' : 'Nenhuma descrição disponível.';
      let descId = `move-desc-${pokemon.id}-${i}`;
      let enName = moveData.names.find(name => name.language.name === 'en')?.name || 'Desconhecido';

      movesList.innerHTML += `<li class="moveItem card glow">
                <div class="moveTitle">
                  <p>${enName || 'Desconhecido'}</p>
                  <span class="moveType">
                    <img
                      src=${typeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon}
                      alt="attack type"
                      class="typeIcon"
                    />
                  </span>
                </div>
                <div class="moveDesc">
                  <p class="moveDescription" id="${descId}">
                    ${displayDesc}
                  </p>
                </div>
                <div class="moveStats">
                  <p class="power">Pdr: ${moveData.power || 'N/A'}</p>
                  <p class="acuracy">Prc: ${moveData.accuracy ? `${moveData.accuracy}%` : 'N/A'}</p>
                  <p class="pp">PP: ${moveData.pp || 'N/A'}</p>
                </div>
              </li>`;

      
    }

    if (enName) {
      let enText = enName.replace(/[\f\n\r]/g, ' ');
      document.getElementsByClassName('description')[0].textContent = 'Traduzindo...';
      try {
        const res = await fetch(`/api/translate?text=${encodeURIComponent(enText)}`);
        const data = await res.json();
        enName = data.translated || enText;
      } catch (e) {
        enName = enText;
      }
    }

    if (enDesc) {
      fetch(`/api/translate?text=${encodeURIComponent(enDesc)}`)
        .then(res => res.json())
        .then(data => {
          const el = document.getElementById(descId);
          if (el) el.textContent = data.translated || enDesc;
        })
        .catch(() => {
          const el = document.getElementById(descId);
          if (el) el.textContent = enDesc;
        });
    }
    
    infoSection.classList.add('hidden');
    statsSection.classList.add('hidden');
    movesSection.classList.remove('hidden');
    evosSection.classList.add('hidden');
  }
  else {
    alert('Por favor, insira o nome de um Pokémon.');
  }
}

//função para carregar e exibir as evoluções do pokemon selecionado -- por conta da dificuldade por enquanto apenas mostra as evoluções diretas, 
// ou seja, se o pokemon tiver mais de uma evolução, apenas a primeira será mostrada. O ideal seria mostrar todas as evoluções, mas isso exigiria
//  uma lógica mais complexa para percorrer toda a cadeia evolutiva que irei me empenhar mais para frente.
async function pokeEvos(pokemon) {
  if (pokemon && pokemon.species) {
    const evosList = document.querySelector('.evoList');
    evosList.innerHTML = '';
    let url = pokemon.species.url;
    let temp = await fetch(url);
    let speciesData = await temp.json();
    if (speciesData.evolution_chain) {
      url = speciesData.evolution_chain.url;
      temp = await fetch(url);
      let evoData = await temp.json();
      const evoChain = [];
      //percorre toda a cadeia evolutiva da url ate encontrar o pokemon selecionado e adiciona as evoluções diretas a uma lista
      const collectEvolutions = (node) => {
        if (!node) {
          return;
        }

        if (node.species?.name === pokemon.name) {
          evoChain.push(...node.evolves_to);
          return;
        }

        node.evolves_to.forEach(child => collectEvolutions(child));
      };

      collectEvolutions(evoData.chain);
      evosList.innerHTML = '';
      if (evoChain.length === 0) {
        evosList.innerHTML = '<p>Nenhuma evolução disponível.</p>';
      } else {
        // para cada evolução direta encontrada, busca os dados do pokemon evoluído e exibe o nome, número, imagem e detalhes da evolução (se houver)
        //por enquanto apenas filtra pedra evolutiva, todos os demais casos sao tratados como level up, o que não é o ideal, mas para isso 
        // seria necessário criar uma lógica mais complexa para tratar cada caso de evolução, planejo montar essa logica posteriormente.
        evoChain.forEach(async (evo) => {
          const name = evo.species.name;
          const evoData = await fetchPokemonData(name);
          if (evo.evolution_details[0]?.trigger.name === 'level-up') {
            if (evo.evolution_details[0]?.min_level) {
              evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evo.species.name.charAt(0).toUpperCase() + evo.species.name.slice(1)} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoData.id}.png"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requer subir de nível</p>
                <p class="evoDetails">Nível: ${evo.evolution_details[0]?.min_level}</p>
              </div>
            </article>
            </li>`;
            } else if (evo.evolution_details[0]?.trigger.name === 'level-up' && evo.evolution_details[0]?.location_name && !evo.evolution_details[0]?.min_happiness) {
              evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evo.species.name.charAt(0).toUpperCase() + evo.species.name.slice(1)} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoData.id}.png"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requer subir de nível</p>
                <p class="evoDetails">Nível: ${evo.evolution_details[0]?.min_level}</p>
              </div>
            </article>
            </li>`;
            } else if (evo.evolution_details[0]?.trigger.name === 'level-up' && evo.evolution_details[0]?.min_happiness && evo.evolution_details[0]?.location_name && !evo.evolution_details[0]?.time_of_day) {
              evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evo.species.name.charAt(0).toUpperCase() + evo.species.name.slice(1)} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoData.id}.png"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requer subir de nível</p>
                <p class="evoDetails">Nível: ${evo.evolution_details[0]?.min_level}</p>
              </div>
            </article>
            </li>`;
            }

            else {
              evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evo.species.name.charAt(0).toUpperCase() + evo.species.name.slice(1)} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoData.id}.png"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requer amizade</p>
                <p class="evoDetails">Felicidade Mín: ${evo.evolution_details[0]?.min_happiness}</p>
              </div>
            </article>
            </li>`;
            }
          } else if (evo.evolution_details[0]?.trigger.name === 'use-item') {

            evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evo.species.name.charAt(0).toUpperCase() + evo.species.name.slice(1)} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoData.id}.png"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle"></p>
                <p class="evoDetails"> Requer ${evo.evolution_details[0].item.name.replace(/-/g, ' ')}</p>
              </div>
            </article>
            </li>`;
          } else if (evo.evolution_details[0]?.trigger.name === 'trade' && evo.evolution_details[0]?.held_item) {
            evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evo.species.name.charAt(0).toUpperCase() + evo.species.name.slice(1)} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoData.id}.png"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requer troca</p>
                <p class="evoDetails">Precisa segurar ${evo.evolution_details[0].held_item.name.replace(/-/g, ' ')}</p>
              </div>
            </article>
            </li>`;
          } else if (evo.evolution_details[0]?.trigger.name === 'trade') {
            evosList.innerHTML += `<li class="evoItem">
              <article class="evoItem">
              <p class="evoName">${evo.species.name.charAt(0).toUpperCase() + evo.species.name.slice(1)} - <span class="evoNumber">#${evoData.id}</span></p>
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evoData.id}.png"
                alt="pokemon evo"
                class="evoImage"
              />
              <div class="textCenter">
                <p class="evoTitle">Requer troca</p>
                <p class="evoDetails"></p>
              </div>
            </article>
            </li>`;
          }
        });
      }

      infoSection.classList.add('hidden');
      statsSection.classList.add('hidden');
      movesSection.classList.add('hidden');
      evosSection.classList.remove('hidden');
    }
  }
  else {
    alert('Por favor, insira o nome de um Pokémon.');
  }


}

// Função para reproduzir o som do Pokémon
const playPokemonSound = (pokemonId) => {
  if (isMuted) return;

  try {
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`;
    const audio = new Audio(cryUrl);
    audio.play().catch(error => {
      console.log('Som não disponível para este Pokémon:', error);
    });
  } catch (error) {
    console.error('Erro ao tentar reproduzir som:', error);
  }
}


//função para popular a home com cards de pokemons utilizando paginação de 6 cards por vez para nao sobrecarregar a API e o navegador, 
// por enquanto a paginação é feita apenas para os primeiros 151 pokemons, mas planejo expandir isso para os demais pokemons posteriormente.
const loadHomePage = async (offset = 0, limit = 6, initialSelectedIndex = 0) => {
  const homeContainer = document.querySelector('.home');
  homeContainer.innerHTML = '';
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
    const data = await response.json();
    const pokemonList = data.results;
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
        homeSection.classList.add('hidden');
      });

      pokemonCard.addEventListener('mouseenter', () => {
        updateSelectedCard(index);
      });

      pokemonCard.addEventListener('mouseleave', () => {
        updateSelectedCard(selectedCardIndex);
      });

      homeContainer.appendChild(pokemonCard);
      if (index === initialSelectedIndex) {
        setCardHoveredState(pokemonCard, true);
        selectedCardIndex = index;
      } else {
        setCardHoveredState(pokemonCard, false);
      }
    }

    updateSelectedCard(initialSelectedIndex);
  } catch (error) {
    console.error('Error loading home page:', error);
  }
}

// Inicia o app carregando as traduções e depois a página inicial
async function initApp() {
  try {
    const response = await fetch('pokemon_flavor_texts.json');
    pokemon_flavor_texts = await response.json();
  } catch (error) {
    console.error('Failed to load translated texts:', error);
  }
  loadHomePage();
}

initApp();

// Lógica para os botões de navegação da home
let currentOffset = 0;