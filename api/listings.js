import { put, list, del } from '@vercel/blob';

export default async function handler(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      error: 'Storage not configured. Add a Vercel Blob store to this project in the Vercel dashboard.',
    });
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: 'listing-', limit: 100 });
      // Only match our listing files (listing-{id}.json)
      const listingBlobs = blobs.filter(b => /^listing-[\w-]+\.json$/.test(b.pathname));

      const listings = await Promise.all(
        listingBlobs.map(async b => {
          try { return await (await fetch(b.url)).json(); } catch { return null; }
        })
      );

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
      const pathname = `listing-${listing.id}.json`;
      const { blobs } = await list({ prefix: pathname });
      if (blobs.length) await del(blobs.map(b => b.url));
      await put(pathname, JSON.stringify(listing), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        cacheControlMaxAge: 0,
      });
      return res.status(201).json({ id: listing.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('Blob error:', e);
    return res.status(503).json({ error: 'Storage request failed' });
  }
}
