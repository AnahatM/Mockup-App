/**
 * End-to-end check of GLB/GLTF import: load a hand-built test model, confirm
 * the screen-mesh picker auto-selects the right mesh, apply a screenshot and
 * confirm from canvas pixels that it actually reached the model, then check
 * that a corrupt file surfaces an inline error instead of a blank canvas.
 *
 * Requires `node scripts/make-test-glb.mjs scripts/out/test-model.glb` first.
 */
import { writeFileSync } from 'node:fs'
import puppeteer from 'puppeteer-core'

const out = 'scripts/out/glb'
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
page.on('pageerror', (e) => {
  problems.push(`[pageerror] ${e.message}`)
  console.error('[pageerror]', e.message)
})
page.on('console', (m) => {
  if (m.type() !== 'error') return
  problems.push(`[error] ${m.text()}`)
  console.error('[console.error]', m.text())
})
browser.process()?.on('close', () => console.error('[browser] process closed'))
page.on('close', () => console.error('[page] closed'))
page.on('error', (e) => console.error('[page] renderer error', e))

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await wait(2500)

const results = {}

// --- import the test model -------------------------------------------------

const glbInput = await page.$('input[type=file][accept*="glb"]')
if (!glbInput) throw new Error('GLB import input not rendered')
await glbInput.uploadFile('scripts/out/test-model.glb')
await wait(2000)

results.importedName = await textOf(page, '[class*="nameText"]')
results.meshOptions = await page.evaluate(() => {
  const select = document.querySelector('select[aria-label="Screen mesh"]')
  return select ? [...select.options].map((o) => o.value) : null
})
results.autoSelectedScreen = await page.evaluate(() => {
  const select = document.querySelector('select[aria-label="Screen mesh"]')
  return select?.value ?? null
})

const beforeVariance = await canvasStdDev(page)
await canvasCenterDiff(page) // seeds the baseline centre pixel
await page.screenshot({ path: `${out}-before-texture.png` })

// --- apply a screenshot to the picked screen mesh --------------------------

const tabs = await page.$$('[role="tab"]')
const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
await tabs[labels.findIndex((l) => l?.includes('Screen'))].click()
await wait(400)

const mediaInput = await page.$('input[type=file][accept*="image"]')
if (!mediaInput) throw new Error('media dropzone input not rendered')
await mediaInput.uploadFile('scripts/out/screenshot.png')
await wait(2000)

const afterVariance = await canvasStdDev(page)
const centerDiff = await canvasCenterDiff(page)
await page.screenshot({ path: `${out}-after-texture.png` })

results.canvasStdDevBefore = beforeVariance
results.canvasStdDevAfter = afterVariance
results.centerPixelChanged = centerDiff > 20
results.rendersSomething = afterVariance > 6

// --- a corrupt file must not blank the canvas or crash the app -------------

// Back to the Device tab, where the import control lives.
const deviceTabs = await page.$$('[role="tab"]')
const deviceLabels = await Promise.all(
  deviceTabs.map((t) => t.evaluate((el) => el.textContent)),
)
await deviceTabs[deviceLabels.findIndex((l) => l?.includes('Device'))].click()
await wait(300)

writeFileSync('scripts/out/corrupt.glb', 'not a real glb file')
const problemsBeforeCorrupt = problems.length
const glbInput2 = await page.$('input[type=file][accept*="glb"]')
await glbInput2.uploadFile('scripts/out/corrupt.glb')
await wait(1500)

results.corruptErrorShown = await page.evaluate(() => {
  const alert = document.querySelector('[role="alert"]')
  return alert?.textContent ?? null
})
results.studioSurvivedCorruptFile = await page.evaluate(
  () => document.querySelector('nav[aria-label="Device library"]') !== null,
)
results.newProblemsFromCorruptFile = problems.slice(problemsBeforeCorrupt)

await browser.close()

const ok =
  results.autoSelectedScreen === 'Screen' &&
  results.rendersSomething &&
  results.centerPixelChanged &&
  Boolean(results.corruptErrorShown) &&
  results.studioSurvivedCorruptFile

console.log(JSON.stringify({ ok, ...results, problems }, null, 2))
if (!ok) process.exit(1)

// --- helpers ----------------------------------------------------------------

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function textOf(page, selector) {
  return page.evaluate((sel) => document.querySelector(sel)?.textContent ?? null, selector)
}

/** Standard deviation of the red channel over a downscaled canvas — near-zero
 *  means a blank/uniform frame, i.e. nothing actually rendered. */
async function canvasStdDev(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = 120
    off.height = 120
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0, 120, 120)
    const { data } = ctx.getImageData(0, 0, 120, 120)
    const values = []
    for (let i = 0; i < data.length; i += 4) values.push(data[i])
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const sq = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
    return Math.round(Math.sqrt(sq))
  })
}

/** Diffs the centre pixel of the current frame against the value stashed on
 *  `window` the first time this is called, so a second call reports how much
 *  it moved once a screenshot has been applied. */
async function canvasCenterDiff(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = canvas.width
    off.height = canvas.height
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0)
    const { data } = ctx.getImageData(
      Math.floor(canvas.width / 2),
      Math.floor(canvas.height / 2),
      1,
      1,
    )
    const prev = window.__glbCenterPixel
    window.__glbCenterPixel = [data[0], data[1], data[2]]
    if (!prev) return 0
    return Math.abs(data[0] - prev[0]) + Math.abs(data[1] - prev[1]) + Math.abs(data[2] - prev[2])
  })
}
