export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "Falta la GEMINI_API_KEY en Vercel" });
  }

  try {

    // 🔥 Asegurar que el body esté parseado correctamente
    let body;

    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }

    if (!body || !body.contents) {
      return res.status(400).json({ error: "No se enviaron contents en la solicitud" });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const data = await geminiResponse.json();

    if (data.error) {
      console.error("Error Gemini:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    if (!data.candidates || data.candidates.length === 0) {
      return res.status(500).json({ error: "Gemini no devolvió candidates" });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("Error servidor:", error);
    return res.status(500).json({ error: "Error interno: " + error.message });
  }
}