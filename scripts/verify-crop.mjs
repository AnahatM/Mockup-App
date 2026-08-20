/**
 * End-to-end check of the crop tool: uploads the real screenshot fixture
 * through the real dropzone, applies a crop through the real UI (an aspect
 * preset click, then keyboard-only nudges — no synthetic pointer drag), and
 * proves from actual rendered canvas pixels that the device screen now shows
 * the cropped region rather than the whole image.
 *
 * `scripts/out/screenshot.png` is a tall gradient (dark navy top fading to
 * teal at the bottom) with uniform horizontal bands, so a *vertical* crop
 * move is what produces an unambiguous colour change — a horizontal move
 * would barely register against this particular fixture.
 */
import puppeteer from 'puppeteer-core'
import { readFileSync } from 'node:fs'

const SOURCE = 'scripts/out/screenshot.png'
const sourceBase64 = readFileSync(SOURCE).toString('base64')

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

await page.evaluateOnNewDocument(() => {
  localStorage.setItem('mockup-studio:theme', 'light')
  // Shared by both pixel-sampling helpers below; defined here so it exists
  // in the page before either ever runs.
  window.averageBox = (img, fracX, fracY, size) => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    const cx = Math.round(fracX * img.width)
    const cy = Math.round(fracY * img.height)
    const x = Math.max(0, Math.min(img.width - size, cx - size / 2))
    const y = Math.max(0, Math.min(img.height - size, cy - size / 2))
    const data = ctx.getImageData(x, y, size, size).data
    let r = 0
    let g = 0
    let b = 0
    let n = 0
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      n++
    }
    return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) }
  }
})
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3000))

await openTab(page, 'Screen')

const input = await page.$('input[type=file]')
if (!input) throw new Error('file input not rendered')
await input.uploadFile(SOURCE)
await waitForText(page, 'screenshot.png', 10000)

// Contain, so the whole crop maps onto the screen without cover's own
// cropping muddying what this script is trying to isolate.
const containBtn = await findRadioRetry(page, 'Contain')
if (!containBtn) throw new Error('Contain fit control not found')
await containBtn.click()
await new Promise((r) => setTimeout(r, 800))

// 1:1 leaves plenty of vertical slack to move within (the source is a tall
// portrait image), unlike the full-bleed identity crop.
const squareBtn = await findRadioRetry(page, '1:1')
if (!squareBtn) throw new Error('1:1 aspect preset not found')
await squareBtn.click()
// Selecting a preset re-bakes the cropped image (canvas draw + a second
// decode of the result) and reloads the three.js texture from it — slower
// than a plain state update, especially under swiftshader software
// rendering, so this waits for the render to actually settle rather than a
// short fixed delay.
const sample1 = await waitForSettledScreen(page)
const rect1 = await readCropRect(page)
const expected1 = await sampleSourceAt(page, sourceBase64, rect1)

// Keyboard only: focus the crop body and nudge it down. This is the
// accessibility requirement in action, not just a mouse affordance.
const body = await waitForElement(page, '[aria-label^="Crop region"]')
if (!body) throw new Error('crop body not found')
await body.focus()
for (let i = 0; i < 15; i++) {
  await body.press('ArrowDown')
  await new Promise((r) => setTimeout(r, 60))
}

const sample2 = await waitForSettledScreen(page)
const rect2 = await readCropRect(page)
const expected2 = await sampleSourceAt(page, sourceBase64, rect2)

await browser.close()

const dist = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b)

console.log(
  JSON.stringify(
    {
      rect1,
      rect2,
      sample1,
      expected1,
      sample2,
      expected2,
      onDeviceMovedVisibly: dist(sample1, sample2) > 30,
      sourceMovedVisibly: dist(expected1, expected2) > 30,
      // The fixture goes navy -> teal top to bottom, so nudging the crop
      // down should raise green and lower red on both the source and the
      // device's own rendered pixels.
      deviceTurnedGreener: sample2.g - sample1.g > 10,
      sourceTurnedGreener: expected2.g - expected1.g > 10,
      rectMovedDown: rect2.y > rect1.y + 0.1,
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

/** Mirrors `scripts/verify-media.mjs`'s radio-matching helper. */
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

/** Retries `findRadio`: this repo's shared dev server gets HMR-reloaded by
 * other work in progress elsewhere in the checkout, which can transiently
 * empty the DOM out from under a single lookup. */
async function findRadioRetry(page, name, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const found = await findRadio(page, name).catch(() => null)
    if (found) return found
    await new Promise((r) => setTimeout(r, 300))
  }
  return null
}

async function waitForElement(page, selector, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const el = await page.$(selector).catch(() => null)
    if (el) return el
    await new Promise((r) => setTimeout(r, 300))
  }
  return null
}

async function waitForText(page, text, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const found = await page
      .evaluate((wanted) => document.body.textContent?.includes(wanted) ?? false, text)
      .catch(() => false)
    if (found) return
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`"${text}" never appeared`)
}

/** Reads the crop overlay's own percentage-positioned inline style — the
 * ground truth for what rect the UI actually applied, not a guess at it. */
async function readCropRect(page, timeoutMs = 6000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const rect = await page
      .evaluate(() => {
        const el = document.querySelector('[aria-label^="Crop region"]')
        if (!el) return null
        const read = (prop) => parseFloat(el.style[prop]) / 100
        return { x: read('left'), y: read('top'), width: read('width'), height: read('height') }
      })
      .catch(() => null)
    if (rect) return rect
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error('crop region never rendered')
}

/**
 * Samples the device screen repeatedly until two consecutive samples, 400ms
 * apart, agree — i.e. the re-bake (canvas draw, a second image decode, and a
 * three.js texture reupload) has actually finished, rather than trusting a
 * fixed delay to have been long enough.
 */
async function waitForSettledScreen(page, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs
  let previous = null
  while (Date.now() < deadline) {
    const next = await sampleDeviceScreen(page).catch(() => null)
    await new Promise((r) => setTimeout(r, 400))
    if (!next) continue
    const stable =
      previous &&
      Math.abs(next.r - previous.r) + Math.abs(next.g - previous.g) + Math.abs(next.b - previous.b) < 4
    previous = next
    if (stable) return next
  }
  if (!previous) throw new Error('device screen never rendered a sample')
  return previous
}

/** Averages a small box at the canvas's own centre, where the device screen
 * sits for the default framing — see the task note on avoiding backdrop
 * dilution from sampling the whole canvas. */
async function sampleDeviceScreen(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        const canvas = document.querySelector('canvas')
        const dataUrl = canvas.toDataURL('image/png')
        const img = new Image()
        img.onload = () => resolve(window.averageBox(img, 0.5, 0.5, 30))
        img.src = dataUrl
      }),
  )
}

/** Averages a small box of the ORIGINAL upload at the given crop rect's
 * centre — the independent, ground-truth expectation for what that crop
 * should show. */
async function sampleSourceAt(page, base64, rect) {
  return page.evaluate(
    ({ base64, rect }) =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () =>
          resolve(
            window.averageBox(img, rect.x + rect.width / 2, rect.y + rect.height / 2, 12),
          )
        img.src = `data:image/png;base64,${base64}`
      }),
    { base64, rect },
  )
}
