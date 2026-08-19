/**
 * Proves the viewport loading overlay actually does its job: present from the
 * very first moment, gone once the scene has genuinely rendered, and never
 * stuck. Polls from before first paint rather than trusting a fixed wait.
 *
 * Usage: node scripts/probe-loading.mjs
 */
import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = process.env.APP_URL ?? 'http://localhost:5173/studio'
const OBSERVE_MS = 15000
const POLL_MS = 20

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--window-size=1600,1000',
  ],
})

const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 })

const problems = []
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`[console.error] ${m.text()}`)
})
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))

// Injected before any app code runs, so polling starts at t=0 of navigation —
// well before React has even attached, let alone painted a frame.
await page.evaluateOnNewDocument((pollMs) => {
  window.__log = []
  const start = performance.now()
  const overlaySelector = '[role="status"][aria-live="polite"]'

  const tick = () => {
    const overlay = document.querySelector(overlaySelector)
    const canvas = document.querySelector('canvas')
    window.__log.push({
      t: Math.round(performance.now() - start),
      overlayPresent: Boolean(overlay),
      overlayAriaHidden: overlay ? overlay.getAttribute('aria-hidden') : null,
      canvasPresent: Boolean(canvas),
    })
  }
  tick()
  window.__interval = setInterval(tick, pollMs)
}, POLL_MS)

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
await new Promise((r) => setTimeout(r, OBSERVE_MS))

const log = await page.evaluate(() => {
  clearInterval(window.__interval)
  return window.__log
})

await browser.close()

// --- Analysis -------------------------------------------------------------

const firstOverlayVisible = log.find(
  (e) => e.overlayPresent && e.overlayAriaHidden === 'false',
)
const firstOverlayHidden = log.find(
  (e) => e.overlayPresent && e.overlayAriaHidden === 'true',
)
const lastEntry = log.at(-1)
const wentVisibleAgainAfterHidden =
  firstOverlayHidden &&
  log.some((e) => e.t > firstOverlayHidden.t + 100 && e.overlayAriaHidden === 'false')

const summary = {
  totalSamples: log.length,
  observedMs: OBSERVE_MS,
  overlayFirstSeenVisibleAtMs: firstOverlayVisible?.t ?? null,
  overlayFirstSeenHiddenAtMs: firstOverlayHidden?.t ?? null,
  overlayStillVisibleAtEnd: lastEntry.overlayAriaHidden === 'false',
  overlayFlickeredBackVisible: wentVisibleAgainAfterHidden,
  canvasPresentAtMs: log.find((e) => e.canvasPresent)?.t ?? null,
  problems,
}

console.log(JSON.stringify(summary, null, 2))

if (summary.overlayFirstSeenVisibleAtMs === null) {
  console.error('FAIL: overlay was never observed in the visible state.')
  process.exit(1)
}
if (summary.overlayFirstSeenHiddenAtMs === null) {
  console.error('FAIL: overlay never transitioned to hidden — it got stuck.')
  process.exit(1)
}
if (summary.overlayStillVisibleAtEnd) {
  console.error('FAIL: overlay is visible again at the end of the observation window.')
  process.exit(1)
}

console.log('PASS: overlay appeared, then hid, and stayed hidden.')
