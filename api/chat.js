export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

```
if (req.method === 'OPTIONS') {
    return res.status(200).end();
}

if (req.method !== 'POST') {
    return res.status(405).json({ error: "Método no permitido" });
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    return res.status(500).json({ error: "Falta la GEMINI_API_KEY en las variables de entorno de Vercel" });
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
        console.error("Gemini API error:", errMsg);
        return res.status(response.status || 500).json({ error: errMsg });
    }

    return res.status(200).json(data);

} catch (error) {
    console.error("Error interno:", error.message);
    return res.status(500).json({ error: "Error de conexión: " + error.message });
}
```

}