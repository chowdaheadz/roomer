import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: 'Storage not configured. Add a Vercel Blob store to this project in the Vercel dashboard.',
    });
  }

  const { id } = req.query;
  if (!id || !/^[\w-]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid listing id' });
  }

  const pathname = `listing-${id}.json`;
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: pathname, limit: 1 });
      if (!blobs.length) return res.status(404).json({ error: 'Not found' });
      const r = await fetch(blobs[0].url);
      return res.json(await r.json());
    }

    if (req.method === 'PUT') {
      const listing = req.body;
      if (!listing || typeof listing !== 'object') {
        return res.status(400).json({ error: 'Request body must be a JSON object' });
      }
      // Delete any existing blob(s) for this listing, then write fresh
      const { blobs } = await list({ prefix: pathname });
      if (blobs.length) await del(blobs.map(b => b.url));
      await put(pathname, JSON.stringify(listing), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        cacheControlMaxAge: 0,
      });
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { blobs } = await list({ prefix: pathname });
      if (blobs.length) await del(blobs.map(b => b.url));
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('Blob error:', e);
    return res.status(503).json({ error: 'Storage request failed' });
  }
}
