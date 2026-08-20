/**
 * Verifies the error-handling and 404 work delivered against the router error
 * task: a nonsense URL renders the real 404 page (not a blank route), and a
 * thrown render error renders `RouteErrorPage` instead of react-router's raw
 * "Unexpected Application Error!" screen. Also does a light sanity pass on the
 * studio route (still loads normally) and the shortcuts overlay.
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

mkdirSync('scripts/out', { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'shell',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 850 })
const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const setTheme = (theme) =>
  page.evaluateOnNewDocument((t) => localStorage.setItem('mockup-studio:theme', t), theme)

async function textOf(selector) {
  const el = await page.$(selector)
  if (!el) return null
  return page.evaluate((node) => node.textContent?.trim(), el)
}

async function bodyHasRawRouterError() {
  return page.evaluate(() =>
    document.body.textContent?.includes('Unexpected Application Error') ?? false,
  )
}

async function shoot(name, theme) {
  await page.screenshot({ path: `scripts/out/${name}-${theme}.png` })
}

const results = {}

for (const theme of ['light', 'dark']) {
  await setTheme(theme)

  // (a) A nonsense URL renders the real 404 page.
  await page.goto('http://localhost:5173/this-page-does-not-exist', { waitUntil: 'networkidle0' })
  await wait(500)
  results[`404-${theme}`] = {
    heading: await textOf('h1, [class*="title"]'),
    rawRouterError: await bodyHasRawRouterError(),
    linkCount: await page.$$eval('nav[aria-label="Main destinations"] a', (as) => as.length),
    homeLinkWorks: (await page.$('a[href="/"]')) !== null,
  }
  await shoot('404', theme)

  // (b) A thrown render error renders RouteErrorPage, not react-router's default.
  await page.goto('http://localhost:5173/__crash-test', { waitUntil: 'networkidle0' })
  await wait(500)
  results[`crash-${theme}`] = {
    heading: await textOf('h1'),
    rawRouterError: await bodyHasRawRouterError(),
    hasReload: (await page.$$eval('button', (bs) => bs.some((b) => /Reload/.test(b.textContent ?? '')))),
    hasGoHome: (await page.$$eval('button', (bs) => bs.some((b) => /Go home/.test(b.textContent ?? '')))),
    hasDevDetails: (await page.$('details')) !== null,
  }
  await shoot('crash', theme)
}

// Sanity: the studio route still loads normally through the new StudioErrorBoundary
// wrapper, and the shortcuts help overlay opens on "?".
await setTheme('light')
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await wait(2500)
results.studioLoads = {
  hasCanvas: (await page.$('canvas')) !== null,
  rawRouterError: await bodyHasRawRouterError(),
}
await page.keyboard.press('?')
await wait(400)
results.shortcutsOverlay = {
  open: (await page.$('dialog[open]')) !== null,
  rowCount: await page.$$eval('dialog[open] kbd', (els) => els.length).catch(() => 0),
}
await shoot('shortcuts-help', 'light')

await browser.close()
console.log(JSON.stringify({ results, problems }, null, 2))
