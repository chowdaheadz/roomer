# Roomer — 120 Summer Avenue

A digital open-house companion. Buyers scan a QR code on the front door, get a room-by-room walkthrough on their phone.

## What's in here

| File | What it does |
| --- | --- |
| `index.html` | The whole app — loads React + the consumer view |
| `consumer.jsx` | The React component (overview + room detail) |
| `data.js` | **Edit this** — the listing data (rooms, descriptions, photos, agent info) |
| `styles.css` | Shared styles (warm paper aesthetic) |

No build step. No node_modules. It's a single static page that runs React in the browser. Good enough for one weekend, one listing.

---

## Friday night — fill in the TODOs

Open `data.js` and search for `// TODO`. There are about a dozen — kitchen details, all three bedrooms, both upstairs baths, and the price. Should be a 15-minute conversation.

For room photos: you can either
1. Drop image URLs into the `photos: []` array in `data.js` (easiest if you host on Imgur / Cloudinary), or
2. Drop image files into a `photos/` folder next to `index.html` and reference them like `photos: ["./photos/kitchen-1.jpg"]`.

---

## Saturday morning — deploy

### Option A: Vercel (recommended, 2 minutes)

1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
3. Framework preset: **Other** (it's pure static). Root directory: leave blank.
4. Click Deploy. You'll get a URL like `roomer-summer-ave.vercel.app`.

### Option B: Netlify

1. [app.netlify.com/drop](https://app.netlify.com/drop) — drag the folder onto the page.
2. You're live in ~10 seconds.

### Option C: GitHub Pages

1. Push to a repo. Settings → Pages → Source: `main` branch, `/` (root).
2. URL: `username.github.io/repo-name`.

---

## QR code

1. Go to [qr.io](https://qr.io) or [qrserver.com](https://goqr.me).
2. Paste your deployed URL.
3. Download as PNG (300×300+).
4. Drop into Word / Canva / Pages with the address and "SCAN FOR ROOM-BY-ROOM TOUR".
5. Print on a half-sheet. Tape to front door. Stack on kitchen counter.

---

## After the open house

Ask three buyers: **"Did you scan the code?"** If yes, **"What would have made it more useful?"**

If they actually used it and your wife wants this for every listing → time to build the admin panel and database. Until then, every new listing is just a new branch with a new `data.js`.

---

## Local preview

Just open `index.html` in a browser. No server needed — but if you want one:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```
