async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    });
    if (!r.ok) throw new Error(`${new URL(url).hostname} returned ${r.status}`);
    return r.text();
  } finally {
    clearTimeout(timer);
  }
}

// Strategy 1: JSON-LD structured data (<script type="application/ld+json">)
// Used by Zillow, Redfin, Realtor.com and most modern listing sites.
function tryJsonLd(html) {
  const RE = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = RE.exec(html)) !== null) {
    try {
      let obj = JSON.parse(m[1].trim());
      if (Array.isArray(obj)) obj = obj.find(o => /(residence|house|property|home)/i.test(o['@type'] || '')) || obj[0];
      if (!obj) continue;
      if (!/(residence|house|property|home|realestate)/i.test(obj['@type'] || '')) continue;

      const addr = obj.address || {};
      return clean({
        line1:      addr.streetAddress,
        city:       addr.addressLocality,
        state:      addr.addressRegion,
        zip:        addr.postalCode,
        beds:       num(obj.numberOfBedrooms),
        baths:      num(obj.numberOfBathroomsTotal ?? obj.numberOfBathrooms),
        sqft:       num(obj.floorSize?.value),
        yearBuilt:  num(obj.yearBuilt),
        price:      num(obj.offers?.price ?? obj.price),
        blurb:      str(obj.description, 600),
        heroUrl:    firstImg(obj.image),
      });
    } catch(e) {}
  }
  return null;
}

// Strategy 2: Zillow's __NEXT_DATA__ JSON bundle embedded in the page.
function tryNextData(html) {
  const m = html.match(/<script[^>]+id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    const root = JSON.parse(m[1]);
    const pp = root?.props?.pageProps || {};

    // Older Zillow: gdpClientCache is a JSON string containing property data
    if (pp.gdpClientCache) {
      try {
        const cache = JSON.parse(pp.gdpClientCache);
        const prop = Object.values(cache)[0]?.property;
        if (prop) { const r = normalizeZillow(prop); if (r?.line1) return r; }
      } catch(e) {}
    }

    // Newer Zillow: look in various known paths
    const candidates = [
      pp?.initialReduxState?.gdp?.fullDetails,
      pp?.initialData?.building,
      pp?.listing,
      pp?.homeDetails,
    ];
    for (const prop of candidates) {
      if (!prop) continue;
      const r = normalizeZillow(prop);
      if (r?.line1) return r;
    }
  } catch(e) {}
  return null;
}

function normalizeZillow(p) {
  if (!p) return null;
  const a = p.address || {};
  return clean({
    line1:     a.streetAddress || a.street,
    city:      a.city,
    state:     a.state,
    zip:       a.zipcode || a.zip,
    beds:      num(p.bedrooms),
    baths:     num(p.bathrooms),
    sqft:      num(p.livingArea),
    yearBuilt: num(p.yearBuilt),
    price:     num(p.price ?? p.zestimate),
    blurb:     str(p.description, 600),
    heroUrl:   p.photos?.[0]?.url || p.primaryPhoto?.url || '',
  });
}

// Strategy 3: Open Graph meta tags + text parsing from title/description.
function tryOpenGraph(html) {
  const meta = (name) => {
    const a = html.match(new RegExp(`<meta[^>]+(?:property|name)="${name}"[^>]+content="([^"]*)"`, 'i'));
    const b = html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${name}"`, 'i'));
    return decodeHtmlEntities((a || b || [])[1] || '');
  };

  const title = meta('og:title') || meta('twitter:title') || extractTitle(html);
  const desc  = meta('og:description') || meta('description') || '';
  const image = meta('og:image') || meta('twitter:image') || '';
  const text  = `${title} ${desc}`;

  // Address pattern: "123 Main St, City, ST 12345"
  const addrM = text.match(/(\d+\s+[^,|–\-<>]{3,60}?),\s*([^,|–\-<>]{2,40}?),\s*([A-Z]{2})\s+(\d{5})/);
  const priceM = text.match(/\$\s*([\d,]+)/);
  const bedsM  = text.match(/(\d+)\s*(?:bds?|beds?|bedrooms?)\b/i);
  const bathsM = text.match(/(\d+(?:\.\d)?)\s*(?:ba\b|baths?|bathrooms?)\b/i);
  const sqftM  = text.match(/([\d,]+)\s*(?:sq\.?\s*ft|sqft)\b/i);
  const ybM    = text.match(/\b((?:19|20)\d{2})\b.*?(?:built|yr\.?\s*built)/i)
               || text.match(/(?:built|yr\.?\s*built).*?\b((?:19|20)\d{2})\b/i);

  return clean({
    line1:     addrM ? addrM[1].trim() : '',
    city:      addrM ? addrM[2].trim() : '',
    state:     addrM ? addrM[3] : '',
    zip:       addrM ? addrM[4] : '',
    price:     priceM ? priceM[1].replace(/,/g, '') : '',
    beds:      bedsM  ? bedsM[1]  : '',
    baths:     bathsM ? bathsM[1] : '',
    sqft:      sqftM  ? sqftM[1].replace(/,/g, '') : '',
    yearBuilt: ybM    ? ybM[1]   : '',
    blurb:     str(desc, 600),
    heroUrl:   image,
  });
}

// ----- small helpers -----
const num = (v) => (v != null && v !== '') ? String(v) : '';
const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const firstImg = (v) => Array.isArray(v) ? (v[0]?.url || v[0] || '') : (typeof v === 'string' ? v : '');

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, (v ?? '').toString().trim()]));
}

function decodeHtmlEntities(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function extractTitle(html) {
  return (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || '';
}

function isBlockedPage(html) {
  const t = extractTitle(html).toLowerCase();
  return /access denied|robot|captcha|blocked|verify you are human/.test(t);
}

// ----- main -----
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body || {};
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' });

  let parsed;
  try { parsed = new URL(url); } catch(e) { return res.status(400).json({ error: 'Invalid URL' }); }
  if (!['http:', 'https:'].includes(parsed.protocol)) return res.status(400).json({ error: 'URL must be http or https' });

  // Block private/local addresses
  const host = parsed.hostname;
  if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
    return res.status(400).json({ error: 'Private URLs are not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  try {
    const html = await fetchPage(url);

    if (isBlockedPage(html)) {
      return res.status(422).json({ error: `${host} blocked automated access. Try copying the details manually.` });
    }

    const data = tryJsonLd(html) || tryNextData(html) || tryOpenGraph(html);

    if (!data?.line1) {
      return res.status(422).json({
        error: 'Could not extract an address from that page. The site may require login or block scraping.',
        partial: data,
      });
    }

    return res.json({ ok: true, data });
  } catch(e) {
    if (e.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timed out — the listing site took too long to respond.' });
    }
    return res.status(422).json({ error: e.message || 'Could not fetch the listing page.' });
  }
}
