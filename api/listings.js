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

async function kvSmembers(setKey) {
  const r = await fetch(`${KV_URL()}/smembers/${encodeURIComponent(setKey)}`, { headers: kvHeader() });
  const { result } = await r.json();
  return result || [];
}

export default async function handler(req, res) {
  if (!KV_URL() || !KV_TOKEN()) {
    return res.status(503).json({
      error: 'Storage not configured. Add a Vercel KV store to this project in the Vercel dashboard.',
    });
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const ids = await kvSmembers('listing_ids');
      if (!ids.length) return res.json([]);

      const listings = await Promise.all(ids.map(id => kvGet(`listing:${id}`)));
      const summaries = listings.filter(Boolean).map(l => ({
        id: l.id,
        address: l.address,
        status: l.status,
        agent: { name: l.agent?.name },
        price: l.price,
        beds: l.beds,
        baths: l.baths,
        roomCount: l.floors?.reduce((s, f) => s + f.rooms.length, 0) ?? 0,
        floorCount: l.floors?.length ?? 0,
      }));

      return res.json(summaries);
    }

    if (req.method === 'POST') {
      const listing = req.body;
      if (!listing?.id || !/^[\w-]+$/.test(listing.id)) {
        return res.status(400).json({ error: 'listing.id is required (alphanumeric + dashes only)' });
      }
      await kvSet(`listing:${listing.id}`, listing);
      await kvSadd('listing_ids', listing.id);
      return res.status(201).json({ id: listing.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('KV error:', e);
    return res.status(503).json({ error: 'Storage request failed' });
  }
}
