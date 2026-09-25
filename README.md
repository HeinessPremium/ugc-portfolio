# Eniolamide O. — AI UGC Portfolio

Public portfolio at `/` and a password-protected CMS at `/admin` for adding
or removing videos at any time — no redeploy needed. Videos are stored in
Vercel Blob storage, so there's no file-size limit like a static page has.

## What's inside

- `/` — public portfolio, grouped into Short-form skits / UGC content / Product showcases
- `/admin` — password-gated page: upload a new video (pick category + label), or remove one
- `seed-videos/` — your first 10 samples, ready to upload once via the seed script
- Storage: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (videos + a `manifest.json` that lists them)

## 1. Push this to GitHub

```bash
cd ugc-portfolio
git init
git add .
git commit -m "Initial commit"
```

Create a new empty repo on GitHub, then:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

## 2. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. Framework preset: Next.js (auto-detected). Click **Deploy**.
3. Once deployed, go to your project → **Storage** tab → **Create Database** → **Blob**. Connect it to this project. This automatically adds the `BLOB_READ_WRITE_TOKEN` environment variable — you don't need to set it yourself.
4. Go to **Settings → Environment Variables** and add:
   - `ADMIN_PASSWORD` = a password only you know
5. Redeploy (Settings → Deployments → ⋯ → Redeploy) so the new env var takes effect.

Your site is now live at the `.vercel.app` URL Vercel gives you (or a custom domain, if you add one under Settings → Domains).

## 3. Upload your first 10 videos (one-time)

Run this on your own computer, from the project folder:

```bash
npm install -g vercel      # if you don't have it
vercel link                # connect this folder to your Vercel project
vercel env pull .env.local # pulls the BLOB_READ_WRITE_TOKEN locally
npm install
npm run seed
```

This uploads everything in `seed-videos/` and creates the initial video list.
Refresh your live site — the 10 samples should now appear.

## 4. Add more videos anytime

Go to `yoursite.vercel.app/admin`, enter your `ADMIN_PASSWORD`, and upload a
video with a category and label. It appears on the public page immediately —
no redeploy required. You can also remove any video from the same page.

## Local development (optional)

```bash
npm install
vercel env pull .env.local   # needed so @vercel/blob has a token locally
npm run dev
```

## Notes

- Categories are currently fixed to three: `skit`, `ugc`, `product`. To add a
  fourth, edit the `CATEGORIES` array in `lib/manifest.js`,
  `app/page.js`, and `app/admin/page.js`.
- The admin password is checked on every upload/delete request — there's no
  persistent login session. Keep the password private; anyone with it can
  add or remove videos.
- Uploaded videos are served directly from Vercel Blob's public CDN URLs.
