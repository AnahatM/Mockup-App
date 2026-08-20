/**
 * Verifies tooltips stay on screen.
 *
 * The failing case was a toolbar button near the top edge: the tooltip was
 * placed above the cursor and rendered off the top of the viewport, so it was
 * invisible exactly where it was most needed.
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
await page.setViewport({ width: 1280, height: 900 })
const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/studio', {
  waitUntil: 'domcontentloaded',
  timeout: 60_000,
})
// `domcontentloaded`, not `networkidle0`: the dev server holds an HMR socket
// open, so the network is never idle and the wait always times out.
await page.waitForSelector('canvas', { timeout: 60_000 })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
await wait(3000)

/** Hovers a control and reports where its tooltip landed. */
async function probe(selector, name) {
  const target = await page.$(selector)
  if (!target) return { name, error: 'control not found' }
  await target.evaluate((el) => el.scrollIntoView({ block: 'nearest' }))
  await target.hover()
  await wait(700)

  const result = await page.evaluate(() => {
    const tip = [...document.querySelectorAll('span')].find(
      (el) => getComputedStyle(el).position === 'fixed' && el.textContent?.trim(),
    )
    if (!tip) return null
    const r = tip.getBoundingClientRect()
    return {
      text: tip.textContent?.trim().slice(0, 40),
      left: Math.round(r.left),
      top: Math.round(r.top),
      right: Math.round(r.right),
      bottom: Math.round(r.bottom),
      onScreen:
        r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight,
    }
  })

  // Move away so the next probe starts clean.
  // Park the pointer over the canvas so the next hover is a fresh enter event.
  await page.mouse.move(640, 500)
  await wait(400)
  return { name, ...(result ?? { error: 'no tooltip appeared' }) }
}

const results = []
// Top-left corner: the original failure.
results.push(await probe('aside[aria-label="Devices"] button', 'device rail item'))
results.push(await probe('button[aria-label="Zoom in"]', 'toolbar: zoom in'))
results.push(await probe('button[aria-label="Hide device rail"]', 'toolbar: far left'))
results.push(await probe('button[aria-label="Reset camera"]', 'toolbar: reset'))
results.push(await probe('button[aria-label="Presets"]', 'toolbar: far right'))

await browser.close()
const offScreen = results.filter((r) => r.onScreen === false)
console.log(JSON.stringify({ results, offScreenCount: offScreen.length, problems }, null, 2))
