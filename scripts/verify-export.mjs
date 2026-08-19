/**
 * Verifies PNG export end to end: triggers the real Export button, intercepts
 * the download, and checks the produced PNG's actual pixel dimensions and
 * whether it carries an alpha channel.
 *
 * Dimensions matter because the whole point of resizing the renderer during
 * capture is that export quality is independent of the browser window.
 */
import puppeteer from 'puppeteer-core'
import { readFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const DIR = resolve('scripts/out/downloads')
if (existsSync(DIR)) rmSync(DIR, { recursive: true })
mkdirSync(DIR, { recursive: true })

const transparent = process.argv.includes('--transparent')

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

await openTab(page, 'Export')

// A fixed preset so the expected dimensions are unambiguous: OG image is
// 1200x630, and scale 2 must produce exactly 2400x1260.
await page.select('select[aria-label="Size"]', 'og')
await new Promise((r) => setTimeout(r, 300))
await setRange(page, 'Scale', 2)

if (transparent) {
  await page.click('label[aria-label="Transparent"]')
  await new Promise((r) => setTimeout(r, 400))
}

await clickByText(page, 'Export PNG')
await new Promise((r) => setTimeout(r, 6000))

const files = readdirSync(DIR).filter((f) => f.endsWith('.png'))
let info = null
if (files.length) {
  const buf = readFileSync(`${DIR}/${files[0]}`)
  // PNG IHDR: width and height are big-endian uint32 at byte 16 and 20;
  // byte 25 is the colour type, where 6 means truecolour with alpha.
  info = {
    file: files[0],
    bytes: buf.length,
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    hasAlphaChannel: buf[25] === 6,
  }
}

// An alpha CHANNEL always exists on an alpha canvas; what matters is whether
// the corner pixels are actually transparent. Decode the file back in the
// browser and sample it rather than hand-rolling a PNG un-filterer here.
let cornerAlpha = null
if (info) {
  const base64 = readFileSync(`${DIR}/${files[0]}`).toString('base64')
  cornerAlpha = await page.evaluate(
    (data) =>
      new Promise((resolve) => {
        const image = new Image()
        image.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(image, 0, 0)
          const corner = ctx.getImageData(2, 2, 1, 1).data[3]
          const centre = ctx.getImageData(
            Math.floor(image.width / 2),
            Math.floor(image.height / 2),
            1,
            1,
          ).data[3]
          resolve({ corner, centre })
        }
        image.onerror = () => resolve(null)
        image.src = `data:image/png;base64,${data}`
      }),
    base64,
  )
}

await browser.close()
console.log(
  JSON.stringify(
    {
      requested: { width: 2400, height: 1260, transparent },
      info,
      cornerAlpha,
      dimensionsCorrect: info?.width === 2400 && info?.height === 1260,
      problems,
    },
    null,
    2,
  ),
)

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

async function setRange(page, label, value) {
  await page.evaluate(
    ({ label, value }) => {
      const el = [...document.querySelectorAll('input[type=range]')].find(
        (i) => i.getAttribute('aria-label') === label,
      )
      if (!el) return
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set
      setter.call(el, String(value))
      el.dispatchEvent(new Event('input', { bubbles: true }))
    },
    { label, value },
  )
}
