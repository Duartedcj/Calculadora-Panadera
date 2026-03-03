export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

```
if (req.method === 'OPTIONS') {
    return res.status(200).end();
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    return res.status(500).json({ error: "Falta la GEMINI_API_KEY en Vercel" });
}

const makeRequest = async () => {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        }
    );
    return response;
};

try {
    let response = await makeRequest();

    // Si hay rate limit (429), esperar 2 segundos y reintentar una vez
    if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        response = await makeRequest();
    }

    const data = await response.json();

    if (data.error) {
        const code = data.error.code || 500;
        const msg = data.error.message || "Error desconocido";

        if (code === 429) {
            return res.status(429).json({ error: "Límite de consultas alcanzado. Espera unos segundos e intenta de nuevo." });
        }
        if (code === 403) {
            return res.status(403).json({ error: "API Key inválida o sin permisos." });
        }
        return res.status(code).json({ error: msg });
    }

    return res.status(200).json(data);

} catch (error) {
    return res.status(500).json({ error: "Error de conexión: " + error.message });
}
```

}
