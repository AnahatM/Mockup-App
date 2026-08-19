/**
 * End-to-end check of the media pipeline: upload a screenshot through the real
 * dropzone, confirm it lands on the device, and exercise the fit modes.
 */
import puppeteer from 'puppeteer-core'

const [, , out = 'scripts/out/media.png', device = '', fit = ''] = process.argv

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

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3000))

if (device) {
  const items = await page.$$('nav[aria-label="Device library"] button')
  for (const item of items) {
    const text = await item.evaluate((el) => el.textContent)
    if (text?.toLowerCase().includes(device.toLowerCase())) {
      await item.click()
      break
    }
  }
  await new Promise((r) => setTimeout(r, 1200))
}

// Open the Screen tab and upload through the real file input.
const tabs = await page.$$('[role="tab"]')
const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
await tabs[labels.findIndex((l) => l?.includes('Screen'))].click()
await new Promise((r) => setTimeout(r, 400))

const input = await page.$('input[type=file]')
if (!input) throw new Error('file input not rendered')
await input.uploadFile('scripts/out/screenshot.png')
await new Promise((r) => setTimeout(r, 2500))

// The filename used to live in a title attribute; it is now visible text
// inside a custom tooltip wrapper.
const loaded = await page.evaluate(() => {
  const el = document.querySelector(
    'aside[aria-label="Inspector"] span[class*="titleText"]',
  )
  return el?.textContent ?? null
})

if (fit) {
  const btn = await findRadio(page, fit)
  if (btn) {
    await btn.click()
    await new Promise((r) => setTimeout(r, 1200))
  }
}

await page.screenshot({ path: out })
await browser.close()
console.log(JSON.stringify({ loaded, problems }, null, 2))

/**
 * Finds a segmented-control option by its accessible name.
 *
 * Segments used to carry a `title` attribute; they now carry `aria-label` when
 * icon-only and visible text when labelled, so match on either.
 */
async function findRadio(page, name) {
  const radios = await page.$$('[role="radio"]')
  for (const radio of radios) {
    const match = await radio.evaluate(
      (el, wanted) =>
        el.getAttribute('aria-label') === wanted || el.textContent?.trim() === wanted,
      name,
    )
    if (match) return radio
  }
  return null
}
