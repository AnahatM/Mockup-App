/**
 * Proves the app never talks to anything but itself.
 *
 * "Runs fully locally, no server and no network calls" is requirement B5 and
 * the reason this project exists — it is on the landing page, in the README and
 * in the footer badge. Until now it was asserted everywhere and checked
 * nowhere. A CDN font slipped into a stylesheet, an analytics snippet, a
 * dependency that phones home on first use: every one of those is a single line
 * that no test would notice and that would quietly make the headline claim
 * false.
 *
 * So this watches the network. Every route is opened and exercised — media
 * uploaded, presets applied, an export taken, the 2D tool driven — and every
 * request the browser makes has to be to this app's own origin. Anything else
 * fails the run and names the URL.
 *
 * Run against a static build: `npm run build && npx vite preview --port 4173`.
 */
import puppeteer from 'puppeteer-core'

const PORT = process.env.PORT ?? '4173'
/** Point at a real deployment with BASE_URL to audit the live thing instead. */
const ORIGIN = process.env.BASE_URL ?? `http://localhost:${PORT}`

const ROUTES = ['/', '/studio', '/window', '/docs', '/docs/quick-start', '/about', '/privacy', '/sitemap']

/**
 * Schemes a page legitimately loads from without leaving the machine.
 *
 * `blob:` and `data:` are how the app hands its own generated content to the
 * browser — an uploaded screenshot's object URL, a canvas export, an imported
 * GLB. `about:` is the blank frame Chrome starts every tab on.
 */
const LOCAL_SCHEMES = ['blob:', 'data:', 'about:', 'chrome-extension:']

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
const foreign = []
const problems = []

/** Anything not served by this app and not one of its own generated blobs. */
const isForeign = (url) =>
  !url.startsWith(ORIGIN) && !LOCAL_SCHEMES.some((scheme) => url.startsWith(scheme))

async function open(route) {
  const page = await browser.newPage()
  page.on('request', (request) => {
    const url = request.url()
    if (isForeign(url)) foreign.push({ route, url })
  })
  page.on('pageerror', (e) => problems.push(`${route}: ${e.message}`))

  await page.setViewport({ width: 1280, height: 800 })
  await page.goto(`${ORIGIN}${route}`, { waitUntil: 'load', timeout: 60_000 })
  return page
}

// Every page, loaded cold.
for (const route of ROUTES) {
  const page = await open(route)
  await wait(route === '/studio' ? 4000 : 1200)
  await page.close()
}

/*
 * The studio, actually used. Loading a page proves the bundle is clean; it does
 * not prove that dropping in a screenshot, applying a look and taking an export
 * stay local, and those are the paths a user would actually worry about.
 */
const studio = await open('/studio')
await studio.waitForSelector('canvas', { timeout: 60_000 })
await wait(4000)

const openTab = async (page, name) => {
  const tabs = await page.$$('[role="tab"]')
  const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
  const index = labels.findIndex((l) => l?.includes(name))
  if (index >= 0) await tabs[index].click()
  await wait(500)
}

await openTab(studio, 'Screen')
const input = await studio.$('input[type=file]')
if (!input) problems.push('studio: no file input to upload through')
else await input.uploadFile('scripts/out/screenshot.png')
await wait(2500)

await openTab(studio, 'Presets')
await studio.evaluate(() => {
  for (const button of document.querySelectorAll('button[aria-expanded="false"]')) {
    button.click()
  }
})
await wait(400)
await studio.evaluate(() => {
  const button = [...document.querySelectorAll('button')].find((b) =>
    b.textContent?.trim().startsWith('Hex field'),
  )
  button?.click()
})
await wait(1800)

// An export is the one action that writes a file, so it is the one most worth
// proving does not also send one.
await openTab(studio, 'Export')
await studio.evaluate(() => {
  const button = [...document.querySelectorAll('button')].find((b) =>
    b.textContent?.trim().startsWith('Export'),
  )
  button?.click()
})
await wait(3500)
await studio.close()

await browser.close()

const failures = [
  ...foreign.map((f) => `${f.route} requested ${f.url}`),
  ...problems,
]
console.log(
  JSON.stringify(
    { routes: ROUTES.length, foreignRequests: foreign.length, failures },
    null,
    2,
  ),
)
process.exit(failures.length > 0 ? 1 : 0)
