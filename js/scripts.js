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
const searchInput = document.getElementById('searchInput');
const infoSection = document.querySelector('.PokeInfo');
const statsSection = document.querySelector('.pokeStats');
const movesSection = document.querySelector('.pokeMoves');
const evosSection = document.querySelector('.pokeEvos');

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
}

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

leftButton.addEventListener('click', () => {
  // Logic for left button
});

rightButton.addEventListener('click', () => {
  // Logic for right button
});

upButton.addEventListener('click', () => {
  // Logic for up button
});

downButton.addEventListener('click', () => {
  // Logic for down button
});

centerButton.addEventListener('click', () => {
  // Logic for center button
});

//Função para fazer a busca
const buscarPokemon = async () => {
    const pokemonName = searchInput.value.trim();
    if (pokemonName) {
        const pokemon = await fetchPokemonData(pokemonName);
        if (pokemon) {
            pokeInfo(pokemon);
            searchInput.value = ''; // Limpar o input após a busca bem-sucedida
        }
    } else {
        alert('Please enter a Pokemon name.');
    }
};

//logica ao clicar no okbutton
okButton.addEventListener('click', buscarPokemon);

//logica ao pressionar Enter no input de pesquisa
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        buscarPokemon();
    }
});

//Função para resetar o Pokedex ao estado inicial
const resetPokedex = () => {
    // Limpar nome e número do Pokémon
    document.getElementById('PokemonName').textContent = '';
    document.getElementById('PokemonNumber').textContent = '';
    document.getElementById('PokemonGif').src = '';
    
    // Resetar para o estado inicial (Pikachu)
    document.getElementsByClassName('PokemonSpecies')[0].textContent = '';
    document.getElementsByClassName('PokemonNumber')[0].textContent = '';
    
    // Limpar containers de tipo, fraqueza e eficácia
    document.querySelector('.typeContainer').innerHTML = '';
    document.querySelector('.weaknessContainer').innerHTML = '';
    document.querySelector('.effectivenessContainer').innerHTML = '';
    
    // Resetar dados físicos
    document.getElementsByClassName('altura')[0].textContent = '';
    document.getElementsByClassName('peso')[0].textContent = '';
    
    // Resetar descrição
    document.getElementsByClassName('genera')[0].textContent = '';
    document.getElementsByClassName('description')[0].textContent = '';
    
    // Limpar move list e evo list
    const movesList = document.querySelector('.moveList');
    const evosList = document.querySelector('.evoList');
    if (movesList) movesList.innerHTML = '';
    if (evosList) evosList.innerHTML = '';
    
    // Mostrar apenas a seção de info e esconder as outras
    infoSection.classList.add('hidden');
    statsSection.classList.add('hidden');
    movesSection.classList.add('hidden');
    evosSection.classList.add('hidden');
};

backButton.addEventListener('click', resetPokedex);


async function pokeInfo(pokemon) {
  // contenção de erros
  if (!infoSection || !statsSection || !movesSection || !evosSection) {
    console.error('One or more info sections were not found in the DOM.');
    return;
  }

    if (pokemon && pokemon.name) {
        document.getElementById('PokemonName').textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
        document.getElementById('PokemonNumber').textContent = `#${pokemon.id.toString().padStart(4, '0')}`;
        if (pokemon.id <= 649) {
            document.getElementById('PokemonGif').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`;
        } else {
            document.getElementById('PokemonGif').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
        }
        document.getElementsByClassName('PokemonSpecies')[0].textContent = `${pokemon.species.name}`;
        document.getElementsByClassName('PokemonNumber')[0].textContent = `#${pokemon.id}`;
                
      // define os containers e limpa os ícones de tipo, fraqueza e eficácia anteriores
        const typeContainer = document.querySelector('.typeContainer');
        const weaknessContainer = document.querySelector('.weaknessContainer');
        const effectivenessContainer = document.querySelector('.effectivenessContainer');               
        typeContainer.innerHTML = '';
        effectivenessContainer.innerHTML = '';
        weaknessContainer.innerHTML = '';
                
        const typeIcon = document.createElement('img');
        typeIcon.classList.add('typeIcon');
        let url = pokemon.types[0].type.url;
        let temp = await fetch(url);
        let typeData = await temp.json();
        typeIcon.src = typeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
        typeContainer.appendChild(typeIcon);
                
        typeData.damage_relations.double_damage_from.forEach(async (type) => {
            const typeIcon = document.createElement('img');
            typeIcon.classList.add('typeIcon');
            url = type.url;
            temp = await fetch(url);
            typeData = await temp.json();
            typeIcon.src = typeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
            weaknessContainer.appendChild(typeIcon);
        });
                
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
                    
        if (pokemon.types.length > 1) {
            url = pokemon.types[1].type.url;
            temp = await fetch(url);
            typeData = await temp.json();
            const typeIcon = document.createElement('img');
            typeIcon.classList.add('typeIcon');
            typeIcon.src = typeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon;
            document.querySelector('.typeContainer').appendChild(typeIcon);
        }

        url = pokemon.species.url;
        temp = await fetch(url);
        const speciesData = await temp.json();
        const generaEntry = speciesData.genera.find(entry => entry.language.name === 'en');
        const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        document.getElementsByClassName('genera')[0].textContent = generaEntry ? generaEntry.genus : 'No genus available.';
        document.getElementsByClassName('description')[0].textContent = flavorTextEntry ? flavorTextEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.';
        document.getElementsByClassName('altura')[0].textContent = ` ${pokemon.height / 10} m`;
        document.getElementsByClassName('peso')[0].textContent = ` ${pokemon.weight / 10} kg`;
        infoSection.classList.remove('hidden');
        statsSection.classList.add('hidden');
        movesSection.classList.add('hidden');
        evosSection.classList.add('hidden');
    }
    else {
        alert('Please enter a Pokemon name.');
    }
}

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
        alert('Please enter a Pokemon name.');
    }
}

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
            movesList.innerHTML += `<li class="moveItem">
                <div class="moveTitle">
                  <p>${moveData.names.find(name => name.language.name === 'en')?.name || 'Unknown'}</p>
                  <span class="moveType">
                    <img
                      src=${typeData.sprites['generation-viii']['brilliant-diamond-shining-pearl'].name_icon}
                      alt="attack type"
                      class="typeIcon"
                    />
                  </span>
                </div>
                <div class="moveDesc">
                  <p class="moveDescription">
                    ${moveData.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text.replace(/\f/g, ' ') || 'No description available.'}
                  </p>
                </div>
                <div class="moveStats">
                  <p class="power">Pwr: ${moveData.power || 'N/A'}</p>
                  <p class="acuracy">Acc: ${moveData.accuracy ? `${moveData.accuracy}%` : 'N/A'}</p>
                  <p class="pp">PP: ${moveData.pp || 'N/A'}</p>
                </div>
              </li>`;
        }
        infoSection.classList.add('hidden');
        statsSection.classList.add('hidden');
        movesSection.classList.remove('hidden');
        evosSection.classList.add('hidden');
    }
    else {
        alert('Please enter a Pokemon name.');
    }
}

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
          evosList.innerHTML = '<p>No evolutions available.</p>';
        } else {
          console.log(evoChain);
          evoChain.forEach(async (evo) => {
            const name = evo.species.name;
            const evoData = await fetchPokemonData(name);
            console.log(evoData);
            if (evo.evolution_details[0]?.item !== null) {
                        
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
                <p class="evoDetails"> Requires ${evo.evolution_details[0].item.name.replace(/-/g, ' ')}</p>
              </div>
            </article>
            </li>`;
            } else {
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
                <p class="evoDetails"> Requires level up</p>
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
            alert('Please enter a Pokemon name.');
        }
    

}
