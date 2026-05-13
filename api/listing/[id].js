const KV_URL   = () => process.env.KV_REST_API_URL;
const KV_TOKEN  = () => process.env.KV_REST_API_TOKEN;
const kvHeader  = () => ({ Authorization: `Bearer ${KV_TOKEN()}` });

async function kvGet(key) {
  const r = await fetch(`${KV_URL()}/get/${encodeURIComponent(key)}`, { headers: kvHeader() });
  const { result } = await r.json();
  if (result == null) return null;
  return typeof result === 'string' ? JSON.parse(result) : result;
}

async function kvSet(key, value) {
  await fetch(`${KV_URL()}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { ...kvHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  });
}

async function kvSadd(setKey, member) {
  await fetch(`${KV_URL()}/sadd/${encodeURIComponent(setKey)}/${encodeURIComponent(member)}`, {
    method: 'POST',
    headers: kvHeader(),
  });
}

export default async function handler(req, res) {
  if (!KV_URL() || !KV_TOKEN()) {
    return res.status(503).json({
      error: 'Storage not configured. Add a Vercel KV store to this project in the Vercel dashboard.',
    });
  }

  const { id } = req.query;
  if (!id || !/^[\w-]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid listing id' });
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const listing = await kvGet(`listing:${id}`);
      if (!listing) return res.status(404).json({ error: 'Not found' });
      return res.json(listing);
    }

    if (req.method === 'PUT') {
      const listing = req.body;
      if (!listing || typeof listing !== 'object') {
        return res.status(400).json({ error: 'Request body must be a JSON object' });
      }
      await kvSet(`listing:${id}`, listing);
      await kvSadd('listing_ids', id);
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('KV error:', e);
    return res.status(503).json({ error: 'Storage request failed' });
  }
}
