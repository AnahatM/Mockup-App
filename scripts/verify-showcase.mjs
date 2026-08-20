/**
 * Verifies showcase (App Store screenshot) mode end to end against a static
 * build served by `vite preview` — not the dev server, whose HMR would
 * detach the WebGL frame mid-run while other agents edit files concurrently.
 *
 * For every layout preset it: switches to showcase mode, sets a headline,
 * selects the layout, exports at a fixed App Store size, and checks the
 * exported PNG's real pixel dimensions plus a hash of its bytes — so the
 * assertions are "every export is exactly 1290x2796" and "no two layouts
 * produced the same image", not just "a file appeared".
 *
 * The export is captured by intercepting the blob `downloadBlob` (see
 * `src/lib/download.ts`) hands to `URL.createObjectURL`/`<a download>`,
 * rather than by watching the OS download folder: this sandbox's Chrome
 * (151.x) does not honour `Browser.setDownloadBehavior` for this harness —
 * confirmed by re-running the pre-existing `verify-export.mjs` here, which
 * also gets no file — so a download-folder assertion would be testing
 * Chrome's download manager, not this feature.
 */
import puppeteer from 'puppeteer-core'
import { createHash } from 'node:crypto'
import { mkdirSync, existsSync, rmSync } from 'node:fs'

const DIR = 'scripts/out/showcase-downloads'
if (existsSync(DIR)) rmSync(DIR, { recursive: true })
mkdirSync(DIR, { recursive: true })

const PORT = process.env.PORT ?? '4173'
const EXPECTED = { width: 1290, height: 2796 } // App Store 6.7"
const LAYOUTS = ['Single', 'Side by side', 'Hero + flank', 'Staggered row', 'Overlapping fan']

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
const page = await browser.newPage()
await page.setViewport({ width: 1400, height: 1000 })
const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && problems.push(`[error] ${m.text()}`))

await page.evaluateOnNewDocument(() => localStorage.setItem('mockup-studio:theme', 'light'))
await page.evaluateOnNewDocument(installBlobCapture)
await page.goto(`http://localhost:${PORT}/studio`, { waitUntil: 'load', timeout: 60000 })
await sleep(4000)

await fixExportSize(page)
await openTab(page, 'Showcase')
await page.click('label[aria-label="Showcase mode"]')
await sleep(400)
await setText(page, 'Headline', 'Ship faster')
await setText(page, 'Subheading', 'Now available everywhere')
await sleep(300)

const results = []
for (const layout of LAYOUTS) {
  await clickByText(page, layout)
  await sleep(300)
  await page.evaluate(() => {
    window.__captured = []
  })
  await clickByText(page, 'Export showcase PNG')
  const dataUrl = await waitForCapture(page, 120000)
  results.push({ layout, ...describeDataUrl(dataUrl) })
}

await browser.close()

const hashes = new Set(results.map((r) => r.hash))
const dimensionsCorrect = results.every(
  (r) => r.width === EXPECTED.width && r.height === EXPECTED.height,
)

console.log(
  JSON.stringify(
    {
      expected: EXPECTED,
      results: results.map(({ layout, width, height, hash, bytes }) => ({
        layout,
        width,
        height,
        hash,
        bytes,
      })),
      dimensionsCorrect,
      allDistinct: hashes.size === results.length,
      problems,
    },
    null,
    2,
  ),
)

/** Installed before any app script runs. Records every blob-URL download
 * `<a download>` click as a data: URL, keyed on `window.__captured`. */
function installBlobCapture() {
  window.__captured = []
  const blobs = new Map()
  const realCreateObjectURL = URL.createObjectURL.bind(URL)
  URL.createObjectURL = (blob) => {
    const url = realCreateObjectURL(blob)
    blobs.set(url, blob)
    return url
  }
  const realClick = HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click = function () {
    const blob = this.download && this.href ? blobs.get(this.href) : null
    if (blob) {
      const reader = new FileReader()
      reader.onload = () => window.__captured.push(reader.result)
      reader.readAsDataURL(blob)
    }
    return realClick.call(this)
  }
}

function describeDataUrl(dataUrl) {
  const buf = Buffer.from(dataUrl.split(',')[1], 'base64')
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    hash: createHash('sha256').update(buf).digest('hex').slice(0, 16),
    bytes: buf.length,
  }
}

async function waitForCapture(page, timeoutMs) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const dataUrl = await page.evaluate(() => window.__captured?.[0] ?? null)
    if (dataUrl) return dataUrl
    await sleep(500)
  }
  throw new Error('Timed out waiting for a showcase export to be produced.')
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fixExportSize(page) {
  await openTab(page, 'Export')
  await page.select('select[aria-label="Size"]', 'app-store-67')
  await sleep(300)
  await setRange(page, 'Scale', 1)
  await sleep(200)
}

async function openTab(page, name) {
  const tabs = await page.$$('[role="tab"]')
  const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
  const index = labels.findIndex((l) => l?.includes(name))
  if (index < 0) throw new Error(`tab ${name} not found`)
  await tabs[index].click()
  await sleep(500)
}

async function clickByText(page, text) {
  const buttons = await page.$$('button')
  for (const button of buttons) {
    const label = await button.evaluate((el) => el.textContent)
    if (label?.includes(text)) {
      await button.click()
      return
    }
  }
  throw new Error(`button "${text}" not found`)
}

async function setRange(page, label, value) {
  await page.evaluate(
    ({ label, value }) => {
      const el = [...document.querySelectorAll('input[type=range]')].find(
        (i) => i.getAttribute('aria-label') === label,
      )
      if (!el) return
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      setter.call(el, String(value))
      el.dispatchEvent(new Event('input', { bubbles: true }))
    },
    { label, value },
  )
}

async function setText(page, label, value) {
  await page.evaluate(
    ({ label, value }) => {
      const el = [...document.querySelectorAll('input[type=text]')].find(
        (i) => i.getAttribute('aria-label') === label,
      )
      if (!el) return
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      setter.call(el, value)
      el.dispatchEvent(new Event('input', { bubbles: true }))
    },
    { label, value },
  )
}
