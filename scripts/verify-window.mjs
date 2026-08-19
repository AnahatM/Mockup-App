/**
 * Verifies the 2D window mockup: upload a screenshot, wrap it in browser chrome,
 * confirm it renders on the device screen, and export the flat PNG.
 */
import puppeteer from 'puppeteer-core'
import { readFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const DIR = resolve('scripts/out/downloads')
if (existsSync(DIR)) rmSync(DIR, { recursive: true })
mkdirSync(DIR, { recursive: true })

const device = process.argv[2] ?? 'Pro Laptop'
const style = process.argv[3] ?? 'browser'

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

const client = await page.createCDPSession()
await client.send('Browser.setDownloadBehavior', {
  behavior: 'allow',
  downloadPath: DIR,
  eventsEnabled: true,
})

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))

// Pick the device.
const items = await page.$$('nav[aria-label="Device library"] button')
for (const item of items) {
  const text = await item.evaluate((el) => el.textContent)
  if (text?.toLowerCase().includes(device.toLowerCase())) {
    await item.click()
    break
  }
}
await new Promise((r) => setTimeout(r, 1200))

// Upload, then turn on window chrome.
await openTab(page, 'Screen')
const input = await page.$('input[type=file]')
await input.uploadFile('scripts/out/screenshot.png')
await new Promise((r) => setTimeout(r, 2500))

const frameButton = await page.$(
  `[role="radio"][title="${style === 'browser' ? 'Browser' : 'macOS'}"]`,
)
if (!frameButton) throw new Error('window style control not found')
await frameButton.click()
await new Promise((r) => setTimeout(r, 2000))

await page.screenshot({ path: `scripts/out/window-${style}.png` })

await clickByText(page, 'Export window PNG')
await new Promise((r) => setTimeout(r, 4000))

const files = readdirSync(DIR).filter((f) => f.endsWith('.png'))
let flat = null
if (files.length) {
  const buf = readFileSync(`${DIR}/${files[0]}`)
  flat = {
    file: files[0],
    bytes: buf.length,
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  }
}

await browser.close()
console.log(JSON.stringify({ device, style, flat, problems }, null, 2))

async function openTab(page, name) {
  const tabs = await page.$$('[role="tab"]')
  const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
  const index = labels.findIndex((l) => l?.includes(name))
  if (index < 0) throw new Error(`tab ${name} not found`)
  await tabs[index].click()
  await new Promise((r) => setTimeout(r, 500))
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
