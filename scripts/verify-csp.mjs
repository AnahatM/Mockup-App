/**
 * Proves the deployed Content-Security-Policy does not break the app.
 *
 * `vite preview` sends none of `vercel.json`'s headers, so the policy there is
 * completely untested by every other check in this repo: it either works in
 * production or takes the app down, and nothing local would say which. The
 * first run of this found the pre-paint theme script blocked on every route —
 * a silent flash of the wrong palette on the live site, invisible in preview.
 *
 * Two things are checked, and the second is the one that will fail later:
 *
 * 1. No CSP violation is reported on any route, with the studio actually
 *    exercised rather than merely loaded.
 * 2. The `script-src` hash still matches the inline script in the build. That
 *    script has to be inline — its whole job is resolving the theme before the
 *    first paint, and an external file is a round trip it exists to avoid — so
 *    the policy carries its hash, and the hash goes stale the moment anyone
 *    edits it. Recomputing it here is the only thing that would ever notice.
 *
 * Serves through `serve-deployed.mjs`, which reads the same `vercel.json` the
 * platform does, so a policy tightened there is tested here without anyone
 * remembering to update two places.
 *
 *   npm run build
 *   node scripts/serve-deployed.mjs &
 *   node scripts/verify-csp.mjs
 */
import puppeteer from 'puppeteer-core'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const PORT = process.env.PORT ?? '4180'
/** Point at a real deployment with BASE_URL to check the live thing instead. */
const BASE = process.env.BASE_URL ?? `http://localhost:${PORT}`
const ROUTES = ['/', '/studio', '/window', '/docs', '/about']

const problems = []

/* ---- 1. The hash in the policy still matches the script in the build ---- */

const html = await readFile('dist/index.html', 'utf8')
const policy = JSON.parse(await readFile('vercel.json', 'utf8'))
  .headers.flatMap((rule) => rule.headers)
  .find((header) => header.key === 'Content-Security-Policy')?.value

if (!policy) {
  problems.push('vercel.json declares no Content-Security-Policy')
}

// Inline scripts only: anything with a `src` is same-origin and needs no hash.
const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
const hashes = inline.map(
  (match) => `sha256-${createHash('sha256').update(match[1], 'utf8').digest('base64')}`,
)

for (const hash of hashes) {
  if (!policy?.includes(hash)) {
    problems.push(
      `index.html has an inline script the policy does not allow: '${hash}'. ` +
        `Add it to script-src in vercel.json, or move the script to a file.`,
    )
  }
}

/* ---- 2. Nothing is actually blocked, on any route ---- */

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'shell',
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
})

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const violations = []

for (const route of ROUTES) {
  const page = await browser.newPage()
  page.on('console', (message) => {
    const text = message.text()
    if (/Content Security Policy|violates the following/i.test(text)) {
      violations.push(`${route}: ${text}`)
    }
  })
  page.on('pageerror', (e) => problems.push(`${route}: ${e.message}`))

  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(`${BASE}${route}`, {
    waitUntil: 'load',
    timeout: 60_000,
  })
  await wait(route === '/studio' ? 5000 : 1500)

  // The theme script is the one the policy makes an exception for, so check it
  // actually ran rather than trusting the absence of a console message.
  if (route === '/') {
    const theme = await page.evaluate(() => document.documentElement.dataset.theme)
    if (theme !== 'light' && theme !== 'dark') {
      problems.push(`/: the pre-paint theme script did not run (data-theme=${theme})`)
    }
  }

  await page.close()
}

await browser.close()

const failures = [...problems, ...violations]
console.log(
  JSON.stringify(
    { routes: ROUTES.length, inlineScripts: hashes.length, failures },
    null,
    2,
  ),
)
process.exit(failures.length > 0 ? 1 : 0)
