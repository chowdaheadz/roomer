# Roomer — 120 Summer Avenue

A digital open-house companion. Buyers scan a QR code on the front door, get a room-by-room walkthrough on their phone.

## What's in here

| File | What it does |
| --- | --- |
| `index.html` | Consumer page — what buyers see when they scan |
| `admin.html` | **Agent admin panel** — edit listings, rooms, photos, get the QR |
| `consumer.jsx` | The React consumer view |
| `admin.jsx` | The React admin UI |
| `data.js` | **The source of truth** — listing data (rooms, descriptions, agent info) |
| `styles.css` | Shared styles (warm paper aesthetic) |

No build step. No node_modules. Static HTML that runs React in the browser.

---

## Two ways to edit the listing

### A. Edit through the admin UI (easier — your wife can do this)

1. Open `/admin.html` (e.g. `roomer-summer-ave.vercel.app/admin.html`)
2. Click any room to edit name / sqft / highlights / description / photos.
3. Edits auto-save to **browser localStorage** — they'll persist if she reloads on the same device, but **only in that browser**.
4. When she's happy with everything, click **Export data.js** in the top bar. That downloads a finished `data.js`.
5. Drop that file into the repo (replacing the old `data.js`), push to GitHub. Vercel redeploys. Done.

> **Why the export step?** This is a static site — no database. localStorage is per-device. Exporting and committing the file is what makes the changes show up for buyers scanning the QR.

### B. Edit `data.js` directly

Open `data.js` in any text editor. Search for `// TODO`. Fill in the blanks. Push.

There are about a dozen TODOs — kitchen details, all three bedrooms, both upstairs baths, and the price. ~15 minutes.

---

## Photos — how they actually work

When you upload a photo in `/admin.html`:
1. It's resized to **1200px on the long edge** and re-encoded as JPEG (~80–120 KB each).
2. It's stored in your browser's localStorage so the preview works.
3. **The photo is NOT live for buyers yet.** Buyers see whatever's in `data.js` on the deployed site.

To make photos public:
1. Finish uploading + writing in `/admin.html`.
2. Click **Export data.js** (top right). You'll get a single `data.js` file with all photos baked in as base64.
3. Replace the `data.js` in your GitHub repo with the downloaded one. Push.
4. Vercel auto-deploys. Now buyers see the photos.

**Size budget:** with all 12 rooms + 5 photos each, your `data.js` will be ~5–7 MB. That's fine for one weekend. If you see a "storage full" warning in the admin, remove a few photos.

For a real product (multiple listings, no size limit) — you'd upload to Cloudinary/S3 instead of base64. Out of scope for the weekend.

---

## Friday night plan

Pour a glass of wine. Open `/admin.html` (or edit `data.js`).

Search for `// TODO`. There are about a dozen — kitchen details, all three bedrooms, both upstairs baths, and the price. Should be a 15-minute conversation.

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
