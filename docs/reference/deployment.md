# Deployment

The app is a static single-page bundle. It has no server, no database and no
environment variables, because it makes no network requests at runtime — so
deploying it is just serving `dist/`.

Production: <https://mockup-studio.anahatmudgal.com>

> **The subdomain does not exist yet.** `mockup-studio.anahatmudgal.com` has no
> DNS record — the apex `anahatmudgal.com` points at Vercel, so the account is in
> place, but this project's domain is not. Until it is, the README badge, the
> sitemap's canonical URLs and the footer link all point at nothing.
>
> The build itself is proven to deploy: an anonymous `vercel deploy --temporary`
> served every route, the SPA rewrite, the CSP and the immutable asset caching
> correctly from real Vercel infrastructure, and both `verify:csp` and
> `verify:offline` pass against a live deployment when pointed at one with
> `BASE_URL`. What is left is account work:
>
> ```sh
> npx vercel login
> npx vercel link --yes
> npx vercel --prod
> ```
>
> then add the subdomain under the project's Domains tab and accept the DNS
> record it offers.

## Checking a real deployment

`verify:csp` and `verify:offline` both take a `BASE_URL`, so the same checks
that run against `serve-deployed.mjs` can be pointed at the live site:

```sh
BASE_URL=https://mockup-studio.anahatmudgal.com npm run verify:csp
BASE_URL=https://mockup-studio.anahatmudgal.com npm run verify:offline
```

Worth doing after the first deploy and after any change to the headers: a CDN
can serve a header the local server does not, and the local server cannot see a
platform that rejects the config outright.

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

## The Content-Security-Policy

The policy is the local-only promise made enforceable rather than only claimed.
`connect-src` names no host at all — there is no API, no analytics and no CDN —
so a dependency that started phoning home would be blocked outright rather than
quietly succeed. `blob:` and `data:` are the app's own generated content: an
uploaded screenshot's object URL, a canvas export, an imported GLB.

`vercel.json` cannot carry comments. Vercel validates the file against a strict
schema and rejects any key it does not recognise — including a `"//"` comment
inside a `headers` entry, which fails the deploy outright with
`Invalid vercel.json` before it builds anything. The reasoning lives here
instead, and `serve-deployed.mjs` now refuses the same keys the platform does,
so a config that serves locally is one that will deploy.

**Test it before you deploy.** `vite preview` sends none of these headers, so
the policy is invisible to every other check in the repo — it either works in
production or takes the app down, and nothing local would say which:

```sh
npm run build
npm run serve:deployed &   # serves dist/ reading this same vercel.json
npm run verify:csp
PORT=4180 npm run verify:offline
```

The first run of `verify:csp` found the pre-paint theme script blocked on every
route: a flash of the wrong palette on the live site that no preview would ever
have shown. That script has to be inline — its whole job is beating the first
paint — so `script-src` carries its SHA-256, and `verify:csp` recomputes the
hash from the build and fails if anyone edits the script without updating the
policy. That drift is otherwise completely silent.

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
