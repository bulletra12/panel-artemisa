// Función intermediaria: recibe el mensaje del chat, le agrega la llave
// (guardada de forma segura en Vercel) y llama a Anthropic. La llave NUNCA
// llega al navegador.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Método no permitido' } });
  }

  const key = process.env.ANTHROPIC_KEY;
  if (!key) {
    return res.status(500).json({ error: { message: 'Falta ANTHROPIC_KEY en Vercel' } });
  }

  try {
    const { system, messages } = req.body || {};

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: system || '',
        messages: messages || []
      })
    });

    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: String(err) } });
  }
}
