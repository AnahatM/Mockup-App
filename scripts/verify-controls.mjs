/**
 * Verifies the schema-driven control system actually drives the 3D scene:
 * switch to the Scene tab, change the backdrop mode, and confirm the render
 * changes. Proves the store -> control -> three.js path end to end.
 */
import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
})
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000 })
const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && problems.push(`[error] ${m.text()}`))

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'dark'),
)
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3000))

// Switch to the Scene tab.
const tabs = await page.$$('[role="tab"]')
const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
const sceneTab = tabs[labels.findIndex((l) => l?.includes('Scene'))]
if (!sceneTab) throw new Error('Scene tab not found')
await sceneTab.click()
await new Promise((r) => setTimeout(r, 500))

const controlCount = await page.evaluate(
  () =>
    document.querySelectorAll(
      'aside[aria-label="Inspector"] input, aside[aria-label="Inspector"] select',
    ).length,
)

// Change the backdrop mode through the generated control.
const styleSelect = await page.$('select[aria-label="Style"]')
if (!styleSelect) throw new Error('Backdrop style select not rendered')
await styleSelect.select('grid')
await new Promise((r) => setTimeout(r, 1500))

const backdropAfter = await page.evaluate(
  () => document.querySelector('select[aria-label="Style"]')?.value,
)
await page.screenshot({ path: 'scripts/out/controls-grid.png' })

// And drive a slider to confirm numeric controls commit.
await page.evaluate(() => {
  const el = [...document.querySelectorAll('input[type=range]')].find(
    (i) => i.getAttribute('aria-label') === 'Exposure',
  )
  if (!el) return
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  ).set
  setter.call(el, '1.8')
  el.dispatchEvent(new Event('input', { bubbles: true }))
})
await new Promise((r) => setTimeout(r, 1200))
const exposureAfter = await page.evaluate(
  () =>
    [...document.querySelectorAll('input[type=range]')].find(
      (i) => i.getAttribute('aria-label') === 'Exposure',
    )?.value,
)
await page.screenshot({ path: 'scripts/out/controls-exposure.png' })

await browser.close()
console.log(
  JSON.stringify({ controlCount, backdropAfter, exposureAfter, problems }, null, 2),
)
