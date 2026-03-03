module.exports = async function handler(req, res) {
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
        const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(geminiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            const errMsg = data.error?.message || `Error HTTP ${response.status}`;
            return res.status(response.status || 500).json({ error: errMsg });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Error de conexion: " + error.message });
    }
}
