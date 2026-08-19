# Deployment

The app is a static single-page bundle. It has no server, no database and no
environment variables, because it makes no network requests at runtime — so
deploying it is just serving `dist/`.

Production: <https://mockup-studio.anahatmudgal.com>

## Vercel

`vercel.json` at the repo root configures it:

- **`rewrites`** — every path serves `index.html`. This is the one piece of
  configuration the app genuinely needs. Routing is client-side, so without it
  a visitor who opens `/docs/quick-start` directly, or refreshes on it, gets a
  404 from the CDN rather than the page. It only affects paths with no matching
  static file, so real assets are still served normally.
- **`headers`** — hashed assets under `/assets/` are immutable and cached for a
  year; `index.html` is deliberately not, so a deploy is picked up immediately.
  The security headers are conservative defaults. `Permissions-Policy` denies
  camera, microphone and geolocation because the app never asks for any of
  them, so the denial can be absolute.

## The sitemap

`npm run build` runs `scripts/build-sitemap.mjs` before `vite build`, so
`sitemap.xml` and `robots.txt` are regenerated from the route table and the
docs registry on every deploy and cannot go stale.

Set `SITE_URL` to override the base URL used in the sitemap; it defaults to the
production domain above.

## Anywhere else

Any static host works. The only requirement is the SPA fallback — serve
`index.html` for unmatched paths. For example, Netlify:

```
/*  /index.html  200
```
