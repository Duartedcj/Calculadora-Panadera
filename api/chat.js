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

        // Validación crítica: Gemini requiere contents
        if (!req.body || !req.body.contents) {
            return res.status(400).json({ 
                error: "El cuerpo de la solicitud debe incluir 'contents'" 
            });
        }

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(req.body),
            }
        );

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            return res.status(geminiResponse.status).json({
                error: data.error?.message || "Error en respuesta del modelo"
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({
            error: "Error de conexión: " + error.message
        });
    }
}