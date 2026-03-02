export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: "Falta la GEMINI_API_KEY en Vercel" });

  try {
    // 👇 Parsear body con seguridad
    const { contents } = req.body || {};

    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ error: "contents no recibido desde el frontend" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await response.json();

    if (data.error) return res.status(data.error.code || 500).json({ error: data.error.message });

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Error de conexión: " + err.message });
  }
}