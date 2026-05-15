const fs = require('fs');
const { translate } = require('@vitalets/google-translate-api');

async function translateFile() {
  const filePath = '../pokemon_flavor_texts.json';
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const keys = Object.keys(data);
  
  console.log(`Translating ${keys.length} items...`);
  
  // Translate in chunks
  const chunkSize = 50;
  for (let i = 0; i < keys.length; i += chunkSize) {
    const chunkKeys = keys.slice(i, i + chunkSize);
    console.log(`Translating chunk ${i} to ${i + chunkKeys.length}...`);
    
    // Process items in parallel for the chunk, but sequentially between chunks
    await Promise.all(chunkKeys.map(async (key) => {
      const enText = data[key].flavor_text;
      if (enText === "Nenhuma descrição disponível.") {
        return;
      }
      
      try {
        const { text } = await translate(enText, { to: 'pt' });
        data[key].flavor_text = text;
      } catch (err) {
        console.error(`Failed to translate item ${key}: ${err.message}`);
        // keep original text on failure
      }
    }));
    
    // small delay to prevent rate limit
    await new Promise(res => setTimeout(res, 2000));
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('Translation complete!');
}

translateFile().catch(console.error);
