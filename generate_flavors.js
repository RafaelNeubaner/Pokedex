const fs = require('fs');

async function generateFlavors() {
  console.log("Fetching data from PokeAPI GraphQL...");
  const query = `
    query {
      pokemon_v2_pokemonspecies(order_by: {id: asc}) {
        id
        name
        pokemon_v2_pokemonspeciesflavortexts(where: {language_id: {_eq: 9}}, limit: 1) {
          flavor_text
        }
      }
    }
  `;

  const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  const { data } = await response.json();
  const speciesList = data.pokemon_v2_pokemonspecies;

  const result = {};

  for (const species of speciesList) {
    const texts = species.pokemon_v2_pokemonspeciesflavortexts;
    let flavorText = "Nenhuma descrição disponível.";
    if (texts && texts.length > 0) {
      flavorText = texts[0].flavor_text.replace(/[\f\n\r]/g, ' ');
    }
    result[species.id] = {
      name: species.name,
      flavor_text: flavorText
    };
  }

  fs.writeFileSync('pokemon_flavor_texts.json', JSON.stringify(result, null, 2));
  console.log("Successfully wrote to pokemon_flavor_texts.json");
}

generateFlavors().catch(console.error);
