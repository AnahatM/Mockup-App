/**
 * Verifies brand-colour matching end to end: upload a screenshot, read the
 * extracted palette out of the UI, apply a colour to the backdrop glow, and
 * confirm the scene actually changed.
 */
import puppeteer from 'puppeteer-core'

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

const tabs = await page.$$('[role="tab"]')
const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
await tabs[labels.findIndex((l) => l?.includes('Screen'))].click()
await new Promise((r) => setTimeout(r, 400))

const input = await page.$('input[type=file]')
await input.uploadFile('scripts/out/screenshot.png')
await new Promise((r) => setTimeout(r, 2500))

const palette = await page.evaluate(() =>
  [...document.querySelectorAll('button[aria-label^="Apply #"]')].map((b) =>
    b.getAttribute('aria-label').replace('Apply ', ''),
  ),
)

// Apply the first brand colour to the backdrop glow, then read the field back.
const before = await page.evaluate(
  () => document.querySelector('select[aria-label="Apply colour to"]')?.value,
)
const swatch = await page.$('button[aria-label^="Apply #"]')
if (swatch) await swatch.click()
await new Promise((r) => setTimeout(r, 1200))

// Switch to the Scene tab and read the backdrop accent field.
const tabs2 = await page.$$('[role="tab"]')
const labels2 = await Promise.all(tabs2.map((t) => t.evaluate((el) => el.textContent)))
await tabs2[labels2.findIndex((l) => l?.includes('Scene'))].click()
await new Promise((r) => setTimeout(r, 600))
const accent = await page.evaluate(() =>
  document.querySelector('input[aria-label="Accent"]')?.value?.toLowerCase(),
)

await page.screenshot({ path: 'scripts/out/brand.png' })
await browser.close()
console.log(
  JSON.stringify(
    { palette, target: before, accent, matched: palette[0] === accent, problems },
    null,
    2,
  ),
)
