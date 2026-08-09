export default async function handler(request, response) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return response.status(200).json({ 
      warning: "Vercel KV no está conectado en Vercel. Se usará almacenamiento local.",
      result: null
    });
  }

  const key = "finances_data_v1";

  // Handle GET request to fetch latest cloud state
  if (request.method === 'GET') {
    try {
      const kvRes = await fetch(`${url}/get/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await kvRes.json();
      
      const finances = data.result ? JSON.parse(data.result) : null;
      return response.status(200).json(finances);
    } catch (e) {
      return response.status(500).json({ error: e.message });
    }
  }

  // Handle POST request to save updated state
  if (request.method === 'POST') {
    try {
      const body = request.body;
      const kvRes = await fetch(`${url}/set/${key}`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(body))
      });
      const res = await kvRes.json();
      return response.status(200).json({ success: true, result: res.result });
    } catch (e) {
      return response.status(500).json({ error: e.message });
    }
  }

  return response.status(405).json({ error: "Method not allowed" });
}
