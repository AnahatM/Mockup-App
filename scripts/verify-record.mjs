/**
 * Verifies animation and video recording end to end: pick a motion clip, confirm
 * the scene is actually moving, then press the real Record button and check that
 * a playable WebM lands on disk.
 */
import puppeteer from 'puppeteer-core'
import { readFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const DIR = resolve('scripts/out/downloads')
if (existsSync(DIR)) rmSync(DIR, { recursive: true })
mkdirSync(DIR, { recursive: true })

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
await page.setViewport({ width: 1200, height: 850 })
const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`[error] ${m.text()}`)
  if (m.text().includes('[capture]')) problems.push(`[capture] ${m.text()}`)
})

const client = await page.createCDPSession()
await client.send('Browser.setDownloadBehavior', {
  behavior: 'allow',
  downloadPath: DIR,
  eventsEnabled: true,
})

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))

// Choose a turntable so the product is unambiguously in motion.
const clip = process.argv.includes('--static') ? 'none' : 'turntable'
await openTab(page, 'Animate')
await page.select('select[aria-label="Motion"]', clip)
await setRange(page, 'Duration', 4)
await new Promise((r) => setTimeout(r, 1500))

const before = await sample(page)
await new Promise((r) => setTimeout(r, 900))
const after = await sample(page)

// Record a short clip through the real button.
await openTab(page, 'Export')
await setRange(page, 'Duration', 6)
await clickByText(page, 'Record WebM')

// Poll instead of guessing a duration, and capture the button's own state so a
// stall is distinguishable from a slow encode.
const states = []
let files = []
for (let i = 0; i < 30; i += 1) {
  await new Promise((r) => setTimeout(r, 1000))
  states.push(
    await page.evaluate(() => {
      const button = [...document.querySelectorAll('button')].find((b) =>
        /Record|Recording/.test(b.textContent ?? ''),
      )
      const alert = document.querySelector('[role=alert]')
      return {
        button: button?.textContent?.trim() ?? null,
        alert: alert?.textContent ?? null,
      }
    }),
  )
  files = readdirSync(DIR).filter((f) => f.endsWith('.webm'))
  if (files.length) break
}
let video = null
if (files.length) {
  const buf = readFileSync(`${DIR}/${files[0]}`)
  video = {
    file: files[0],
    bytes: buf.length,
    // EBML magic: every Matroska/WebM file starts 1A 45 DF A3.
    isWebm: buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3,
  }
}

await browser.close()
console.log(
  JSON.stringify(
    {
      animating: before !== after,
      frameA: before,
      frameB: after,
      video,
      buttonStates: states.filter(
        (s, i) => i === 0 || s.button !== states[i - 1].button,
      ),
      lastState: states[states.length - 1],
      problems,
    },
    null,
    2,
  ),
)

function sample(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = 48
    off.height = 48
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0, 48, 48)
    const { data } = ctx.getImageData(0, 0, 48, 48)
    let sum = 0
    for (let i = 0; i < data.length; i += 4) sum += data[i] * 3 + data[i + 1]
    return sum
  })
}

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
