const { translate } = require('@vitalets/google-translate-api');

module.exports = async (req, res) => {
  // Allow CORS for local development (Vercel usually handles this, but good to have)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const text = req.query.text || req.body?.text;
    const to = req.query.to || req.body?.to || 'pt';

    if (!text) {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    const result = await translate(text, { to });

    res.status(200).json({
      original: text,
      translated: result.text,
      language: result.raw?.src || 'en'
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: 'Translation failed', details: error.message });
  }
};
