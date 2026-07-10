# For You, Always 🕯️

A small, private website that holds one letter. It opens like a real envelope —
tap the wax seal, watch it crack, and the letter slides out. She can read it
at her own pace, and there's a "listen to it" button that reads it out loud to
her using the browser's built-in voice, with the paragraph being spoken
glowing gently like candlelight.

No backend, no database — just `index.html`, `style.css`, and `script.js`.

## Files
```
index.html    the two "scenes": the envelope, and the letter
style.css     all colors, type, layout, and animation
script.js     the seal-opening sequence, scroll reveal, and read-aloud logic
vercel.json   tiny config so the URL stays clean
```

## Personalizing it further
- **Her name on the envelope**: open `index.html`, find `<span class="envelope__address">For My Love</span>` and change the words.
- **The letter text**: still in `index.html`, inside `<div id="letterBody">` — each paragraph is its own `<p>`.
- **Colors**: all named at the top of `style.css` under `:root` (search for `--gold`, `--blush`, `--midnight`, `--paper`).

## Deploy it on Vercel

**Easiest — no account needed to try locally first:**
Just double-click `index.html` to preview it in a browser before deploying.

**Option A — Vercel dashboard (drag & drop, ~2 minutes)**
1. Go to https://vercel.com and sign in (or make a free account).
2. Click **Add New… → Project**.
3. Choose **"Deploy without Git"** / drag-and-drop, and drop this whole folder in.
4. Vercel builds nothing (it's static) and gives you a live URL right away.
5. Optional: in the project's **Settings → Domains**, add a custom domain or just rename the auto-generated one to something like `for-my-love.vercel.app`.

**Option B — GitHub (best if you'll keep editing it)**
1. Create a new GitHub repo and push these files:
   ```bash
   git init
   git add .
   git commit -m "a letter for her"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. On https://vercel.com, click **Add New… → Project**, then **Import** your GitHub repo.
3. Framework preset: **Other** (it's plain HTML/CSS/JS — no build step needed).
4. Click **Deploy**.

**Option C — Vercel CLI**
```bash
npm install -g vercel
cd love-letter
vercel        # first deploy, follow the prompts
vercel --prod # promote to your production URL
```

## A couple of notes
- The "listen to it" button uses the browser's own text-to-speech (the Web
  Speech API), so there's nothing to upload or host — it just works on
  whatever device she opens the site on. Voice quality depends on her
  browser/OS; iPhones and Android phones both have a built-in voice.
- Everything is responsive down to small phone widths, and respects
  "reduce motion" accessibility settings if she has that turned on.
