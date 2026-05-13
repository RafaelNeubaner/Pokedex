/** @jest-environment jsdom */

const fs = require('fs');
const vm = require('vm');

const scriptCode = fs.readFileSync('js/scripts.js', 'utf8');

describe('scripts.js functions', () => {
  let context;
  let fetchMock;

  const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

  const samplePokemon = {
    name: 'pikachu',
    id: 25,
    sprites: {
      versions: {
        'generation-v': { 'black-white': { animated: { front_default: 'pikachu.gif' } } },
        'generation-viii': { 'brilliant-diamond-shining-pearl': { name_icon: 'type-icon.png' } }
      }
    },
    types: [{ type: { url: 'https://pokeapi.co/api/v2/type/13/' } }],
    species: { url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
    height: 6,
    weight: 60
  };

  const raichuPokemon = {
    name: 'raichu',
    id: 26,
    sprites: { versions: {} },
    types: [],
    species: { url: 'https://pokeapi.co/api/v2/pokemon-species/26/' }
  };

  const speciesData = {
    evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/10/' },
    genera: [{ language: { name: 'en' }, genus: 'Mouse Pokemon' }],
    flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'When several of these POKéMON gather...' }]
  };

  const evolutionChain = {
    chain: {
      species: { name: 'pichu' },
      evolves_to: [
        {
          species: { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon-species/25/' },
          evolves_to: [
            {
              species: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon-species/26/' },
              evolution_details: [{ item: null }]
            }
          ],
          evolution_details: [{ item: null }]
        }
      ]
    }
  };

  const typeData = {
    sprites: { 'generation-viii': { 'brilliant-diamond-shining-pearl': { name_icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl/13.png' } } },
    damage_relations: { double_damage_from: [], double_damage_to: [] }
  };

  beforeEach(() => {
    // set up DOM elements used by the script
    document.body.innerHTML = `
      <span id="PokemonName"></span>
      <span id="PokemonNumber"></span>
      <img id="PokemonGif" src="" />
      <div class="PokeInfo"></div>
      <div class="pokeStats"></div>
      <div class="pokeMoves"></div>
      <div class="pokeEvos"></div>
      <span class="PokemonSpecies">Pikachu</span>
      <span class="PokemonNumber">#0025</span>
      <div class="typeContainer"></div>
      <div class="weaknessContainer"></div>
      <div class="effectivenessContainer"></div>
      <p class="genera"></p>
      <p class="description"></p>
      <span class="altura"></span>
      <span class="peso"></span>
      <ul class="moveList"></ul>
      <ul class="evoList"></ul>
      <input id="searchInput" />
      <button id="okButton"></button>
      <button id="backButton"></button>
      <div id="leftButton"></div>
      <div id="rightButton"></div>
      <div id="upButton"></div>
      <div id="downButton"></div>
      <div id="centerButton"></div>
      <p class="navItem info"></p>
      <p class="navItem stats"></p>
      <p class="navItem moves"></p>
      <p class="navItem evos"></p>
    `;

    // Mock fetch to return appropriate responses depending on URL
    fetchMock = jest.fn((url) => {
      if (url.includes('/pokemon-species/25')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(speciesData) });
      }
      if (url.includes('/evolution-chain/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(evolutionChain) });
      }
      if (url.includes('/type/')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(typeData) });
      }
      if (url.includes('/pokemon/raichu')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(raichuPokemon) });
      }
      if (url.includes('/pokemon/pikachu')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(samplePokemon) });
      }
      // fallback
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    // prepare vm context with DOM and mocks
    context = {
      window,
      document,
      console,
      alert: jest.fn(),
      fetch: fetchMock,
      setTimeout,
      clearTimeout
    };
    vm.createContext(context);
    vm.runInContext(scriptCode, context);
    // Copy top-level const/let/arrow functions into the context global so tests can call them
    const toExport = ['fetchPokemonData', 'buscarPokemon', 'resetPokedex', 'pokeEvos'];
    toExport.forEach(name => {
      try {
        vm.runInContext(`this.${name} = ${name};`, context);
      } catch (e) {
        // ignore if a symbol is not defined in the script
      }
    });
  });

  test('fetchPokemonData returns pokemon object', async () => {
    const result = await context.fetchPokemonData('pikachu');
    expect(result).toBeDefined();
    expect(result.name).toBe('pikachu');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v2/pokemon/pikachu'));
  });

  test('buscarPokemon calls pokeInfo and clears input', async () => {
    const input = document.getElementById('searchInput');
    input.value = 'pikachu';
    await context.buscarPokemon();
    expect(document.getElementById('PokemonName').textContent).toBe('Pikachu');
    expect(input.value).toBe('');
  });

  test('resetPokedex clears fields', () => {
    document.getElementById('PokemonName').textContent = 'Bulbasaur';
    document.getElementsByClassName('PokemonSpecies')[0].textContent = 'bulbasaur';
    context.resetPokedex();
    expect(document.getElementById('PokemonName').textContent).toBe('');
    expect(document.getElementsByClassName('PokemonSpecies')[0].textContent).toBe('');
  });

  test('pokeEvos renders evolution items', async () => {
    // call pokeEvos with samplePokemon (which has species.url pointing to speciesData)
    await context.pokeEvos(samplePokemon);
    await flushPromises();
    await flushPromises();
    const evosList = document.querySelector('.evoList');
    expect(evosList.innerHTML).toContain('raichu'.charAt(0).toUpperCase());
    // verify that fetch was called for evolution pokemon
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v2/pokemon/raichu'));
  });

  test('pokeEvos: no evolutions available', async () => {
    const noEvoChain = { chain: { species: { name: 'pikachu' }, evolves_to: [] } };
    fetchMock.mockImplementation((url) => {
      if (url.includes('/pokemon-species/25')) return Promise.resolve({ ok: true, json: () => Promise.resolve(speciesData) });
      if (url.includes('/evolution-chain/')) return Promise.resolve({ ok: true, json: () => Promise.resolve(noEvoChain) });
      if (url.includes('/pokemon/pikachu')) return Promise.resolve({ ok: true, json: () => Promise.resolve(samplePokemon) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await context.pokeEvos(samplePokemon);
    await flushPromises();
    const evosList = document.querySelector('.evoList');
    expect(evosList.innerHTML).toContain('No evolutions available.');
  });

  test('pokeEvos: single evolution', async () => {
    const oneEvoChain = { chain: { species: { name: 'pikachu' }, evolves_to: [ { species: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon-species/26/' }, evolves_to: [], evolution_details: [{ item: null }] } ] } };
    fetchMock.mockImplementation((url) => {
      if (url.includes('/pokemon-species/25')) return Promise.resolve({ ok: true, json: () => Promise.resolve(speciesData) });
      if (url.includes('/evolution-chain/')) return Promise.resolve({ ok: true, json: () => Promise.resolve(oneEvoChain) });
      if (url.includes('/pokemon/raichu')) return Promise.resolve({ ok: true, json: () => Promise.resolve(raichuPokemon) });
      if (url.includes('/pokemon/pikachu')) return Promise.resolve({ ok: true, json: () => Promise.resolve(samplePokemon) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await context.pokeEvos(samplePokemon);
    await flushPromises();
    const evosList = document.querySelector('.evoList');
    expect(evosList.innerHTML).toContain('Raichu');
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v2/pokemon/raichu'));
  });

  test('pokeEvos: multiple evolutions', async () => {
    const multiEvoChain = { chain: { species: { name: 'pikachu' }, evolves_to: [ { species: { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon-species/26/' }, evolves_to: [], evolution_details: [{ item: null }] }, { species: { name: 'raichu-alola', url: 'https://pokeapi.co/api/v2/pokemon-species/1000/' }, evolves_to: [], evolution_details: [{ item: null }] } ] } };
    const raichuAlola = { name: 'raichu-alola', id: 1000, sprites: { versions: {} }, types: [], species: { url: 'https://pokeapi.co/api/v2/pokemon-species/1000/' } };
    fetchMock.mockImplementation((url) => {
      if (url.includes('/pokemon-species/25')) return Promise.resolve({ ok: true, json: () => Promise.resolve(speciesData) });
      if (url.includes('/evolution-chain/')) return Promise.resolve({ ok: true, json: () => Promise.resolve(multiEvoChain) });
      if (url.includes('/pokemon/raichu')) return Promise.resolve({ ok: true, json: () => Promise.resolve(raichuPokemon) });
      if (url.includes('/pokemon/raichu-alola') || url.includes('/pokemon-species/1000')) return Promise.resolve({ ok: true, json: () => Promise.resolve(raichuAlola) });
      if (url.includes('/pokemon/pikachu')) return Promise.resolve({ ok: true, json: () => Promise.resolve(samplePokemon) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await context.pokeEvos(samplePokemon);
    await flushPromises();
    await flushPromises();
    // ensure the script attempted to fetch data for each evolution
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v2/pokemon/raichu'));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/v2/pokemon/raichu-alola'));
  });
});
