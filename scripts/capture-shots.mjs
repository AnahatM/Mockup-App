/**
 * Captures the marketing screenshots used on the site.
 *
 * Committed as generated output rather than hand-taken screenshots, so they can
 * be regenerated after a UI change instead of slowly going stale — a landing
 * page showing a version of the app that no longer exists is worse than one
 * showing a placeholder.
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const OUT = 'src/assets/shots'
mkdirSync(OUT, { recursive: true })

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
const problems = []

async function shoot({ name, theme, tab, clipToViewport = true }) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 })
  page.on('pageerror', (e) => problems.push(`${name}: ${e.message}`))

  await page.evaluateOnNewDocument(
    (t) => localStorage.setItem('mockup-studio:theme', t),
    theme,
  )
  // `domcontentloaded`, not `networkidle0`: the dev server keeps an HMR socket
  // open, so network is never idle and the wait would always time out.
  await page.goto('http://localhost:5173/studio', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  })
  await page.waitForSelector('canvas', { timeout: 60_000 })
  await wait(4000)

  // Put a real screenshot on the device — an empty screen makes a poor advert.
  const input = await page.$('input[type=file]')
  if (input) {
    await openTab(page, 'Screen')
    await wait(400)
    const fileInput = await page.$('input[type=file]')
    await fileInput.uploadFile('scripts/out/screenshot.png')
    await wait(2500)
  }

  if (tab) {
    await openTab(page, tab)
    await wait(800)
  }
  await wait(1500)

  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: !clipToViewport })
  await page.close()
  return name
}

async function openTab(page, name) {
  const tabs = await page.$$('[role="tab"]')
  const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
  const index = labels.findIndex((l) => l?.includes(name))
  if (index >= 0) await tabs[index].click()
}

const made = []
made.push(await shoot({ name: 'studio-light', theme: 'light', tab: 'Device' }))
made.push(await shoot({ name: 'studio-dark', theme: 'dark', tab: 'Light' }))
made.push(await shoot({ name: 'studio-export', theme: 'light', tab: 'Export' }))

await browser.close()
console.log(JSON.stringify({ made, problems }, null, 2))
