import pg from 'pg';
const { Client } = pg;

export default async function handler(request, response) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    return response.status(200).json({ 
      warning: "DATABASE_URL no está configurada en las variables de entorno de Vercel. Usando base local.",
      result: null
    });
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();

    // Create table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS finances_store (
        key VARCHAR(255) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const key = "finances_socio_v1";

    if (request.method === 'GET') {
      const res = await client.query('SELECT data FROM finances_store WHERE key = $1', [key]);
      const data = res.rows[0] ? res.rows[0].data : null;
      await client.end();
      return response.status(200).json(data);
    }

    if (request.method === 'POST') {
      const body = request.body;
      await client.query(`
        INSERT INTO finances_store (key, data, updated_at) 
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (key) 
        DO UPDATE SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP
      `, [key, JSON.stringify(body)]);
      
      await client.end();
      return response.status(200).json({ success: true });
    }

    await client.end();
    return response.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    try {
      await client.end();
    } catch (_) {}
    return response.status(500).json({ error: e.message });
  }
}
