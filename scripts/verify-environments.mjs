/**
 * Proves the structured backdrop environments actually render, and that the
 * pulsating blocks actually move.
 *
 * Compiling proves very little here: a structure that generates zero cells, or
 * sits on a layer no camera draws, or writes its instance matrices to a mesh
 * that was never sized for them, type-checks perfectly and renders nothing at
 * all. This measures the viewport instead — the same approach as
 * verify-exposure.mjs, which is how "exposure did nothing" was caught.
 *
 * Run against a static build: `npm run build && npx vite preview --port 4173`.
 */
import puppeteer from 'puppeteer-core'

const PORT = process.env.PORT ?? '4173'
/** How different a frame must be from the empty backdrop to count as drawn. */
const MIN_CHANGE = 1.5
/** How different two frames must be, a beat apart, to count as animating. */
const MIN_MOTION = 0.25

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
const page = await browser.newPage()
const problems = []
page.on('pageerror', (e) => problems.push(e.message))

await page.setViewport({ width: 1200, height: 800 })
await page.goto(`http://localhost:${PORT}/studio`, {
  waitUntil: 'load',
  timeout: 60_000,
})
await page.waitForSelector('canvas', { timeout: 60_000 })
await wait(4000)

/** Downsampled RGB of the viewport, as a flat array. */
const sample = () =>
  page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = 160
    off.height = 100
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0, 160, 100)
    return [...ctx.getImageData(0, 0, 160, 100).data]
  })

/** Mean absolute per-channel difference, 0-255. */
function difference(a, b) {
  let sum = 0
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i])
  return sum / a.length
}

async function openTab(name) {
  const tabs = await page.$$('[role="tab"]')
  const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
  const index = labels.findIndex((l) => l?.includes(name))
  if (index >= 0) await tabs[index].click()
}

async function applyPreset(group, name) {
  await openTab('Presets')
  await wait(500)
  await page.evaluate((group) => {
    const btn = [...document.querySelectorAll('button[aria-expanded]')].find(
      (b) => b.textContent?.trim() === group,
    )
    if (btn && btn.getAttribute('aria-expanded') === 'false') btn.click()
  }, group)
  await wait(300)
  const ok = await page.evaluate((name) => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.trim().startsWith(name),
    )
    if (!btn) return false
    btn.click()
    return true
  }, name)
  if (!ok) throw new Error(`preset "${name}" not found`)
  await wait(1400)
}

// Baseline: a scene with no structure in it at all.
await applyPreset('Studio', 'Clean studio')
const empty = await sample()

const results = []
for (const name of ['Hex field', 'Tiled room', 'Pulse grid', 'Concrete cove']) {
  await applyPreset('Environment', name)
  const shot = await sample()
  const change = difference(empty, shot)
  results.push({ name, change: Number(change.toFixed(2)), drawn: change >= MIN_CHANGE })
}

// The block field is the only structure that animates. Two samples a beat
// apart must differ, or `useFrame` is not writing matrices.
await applyPreset('Environment', 'Pulse grid')
const first = await sample()
await wait(900)
const motion = Number(difference(first, await sample()).toFixed(2))

await browser.close()

const failures = [
  ...results
    .filter((r) => !r.drawn)
    .map((r) => `${r.name} did not change the viewport`),
  ...(motion < MIN_MOTION ? ['Pulse grid is not animating'] : []),
  ...problems,
]
console.log(JSON.stringify({ results, motion, failures }, null, 2))
process.exit(failures.length > 0 ? 1 : 0)
