/**
 * Proves no backdrop environment can swallow the scene at any slider setting.
 *
 * Found by pointing a camera at one: with the depth and relief sliders both at
 * their maximum, the tile field's relief gain compounded to fifteen world
 * units against a phone's one and a half, the camera ended up inside a block,
 * and the whole viewport went to flat grey. Nothing failed — it type-checked,
 * it rendered, it animated. It was simply unusable, and every slider in the
 * app has to be safe across its whole range rather than only across the part
 * anyone sensible would drag it to.
 *
 * The measurement is the spread of luminance across the frame. A studio shot
 * has a lit product against a graded backdrop and plenty of it; a camera
 * buried inside geometry sees one flat colour and almost none.
 *
 * Run against a static build: `npm run build && npx vite preview --port 4173`.
 */
import puppeteer from 'puppeteer-core'

const PORT = process.env.PORT ?? '4173'

/**
 * Luminance standard deviation, 0-255, below which the viewport is not showing
 * a scene any more. A clean studio measures around 30; the buried camera that
 * prompted this measured under 2.
 */
const MIN_SPREAD = 8

/**
 * Every structure, at the corners of its own sliders.
 *
 * Each case states *every* slider it depends on, including the ones it wants
 * left at the default. Switching the environment kind does not reset the
 * shared geometry config, so the first version of this let a `Size: 1` from
 * one case leak into the four that followed — which reported four flat
 * viewports that had nothing to do with the settings printed beside them.
 */
const DEFAULTS = { Size: 8, 'Tile size': 0.55, Gap: 0.12, Depth: 0.16, Relief: 0.5 }

const CASES = [
  { kind: 'hex', ranges: { Depth: 3, Relief: 1, Size: 24, 'Tile size': 0.1 } },
  { kind: 'hex', ranges: { Depth: 3, Relief: 1, Size: 2, 'Tile size': 3 } },
  { kind: 'tiles', ranges: { Depth: 3, Relief: 1, Size: 24, Gap: 0 } },
  { kind: 'tiles', ranges: { Depth: 0.02, Relief: 0, Size: 2, Gap: 0.9 } },
  { kind: 'blocks', ranges: { Depth: 3, Relief: 1, 'Pulse height': 3 } },
  { kind: 'blocks', ranges: { Depth: 0.16, 'Pulse height': 3, Size: 4 } },
  { kind: 'room', ranges: { Depth: 3, Relief: 1, 'Wall height': 20, Size: 6 } },
  { kind: 'room', ranges: { 'Wall height': 1, Size: 24 } },
]

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
await page.goto(`http://localhost:${PORT}/studio`, { waitUntil: 'load', timeout: 60_000 })
await page.waitForSelector('canvas', { timeout: 60_000 })
await wait(4000)

const tabs = await page.$$('[role="tab"]')
const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
const scene = labels.findIndex((l) => l?.includes('Scene'))
if (scene >= 0) await tabs[scene].click()
await wait(500)

const setRange = (label, value) =>
  page.evaluate(
    ([l, v]) => {
      const el = [...document.querySelectorAll('input[type=range]')].find(
        (i) => i.getAttribute('aria-label') === l,
      )
      if (!el) return false
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set
      setter.call(el, String(v))
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    },
    [label, value],
  )

const setKind = (kind) =>
  page.evaluate((k) => {
    const el = document.querySelector('select[aria-label="Environment"]')
    if (!el) return false
    const setter = Object.getOwnPropertyDescriptor(
      HTMLSelectElement.prototype,
      'value',
    ).set
    setter.call(el, k)
    el.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }, kind)

/** Luminance standard deviation across a downsampled frame. */
const spread = () =>
  page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = 120
    off.height = 80
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0, 120, 80)
    const { data } = ctx.getImageData(0, 0, 120, 80)

    const lum = []
    for (let i = 0; i < data.length; i += 4) {
      lum.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2])
    }
    const mean = lum.reduce((a, b) => a + b, 0) / lum.length
    const variance = lum.reduce((a, b) => a + (b - mean) ** 2, 0) / lum.length
    return Math.sqrt(variance)
  })

const results = []
for (const testCase of CASES) {
  // Back to a known state, so one case cannot leave a slider set for the next.
  await setKind('none')
  await wait(400)
  if (!(await setKind(testCase.kind))) problems.push('no Environment select found')
  await wait(600)

  for (const [label, value] of Object.entries({ ...DEFAULTS, ...testCase.ranges })) {
    // A slider that is not on screen for this kind is not a problem — the room
    // has no pulse and the block field has no wall height.
    await setRange(label, value)
  }
  await wait(1600)

  const measured = Number((await spread()).toFixed(2))
  if (process.env.SHOTS) await page.screenshot({ path: `scripts/out/ext-${results.length}-${testCase.kind}.png` })
  results.push({
    kind: testCase.kind,
    ranges: testCase.ranges,
    spread: measured,
    ok: measured >= MIN_SPREAD,
  })
}

await browser.close()

const failures = [
  ...results
    .filter((r) => !r.ok)
    .map(
      (r) =>
        `${r.kind} at ${JSON.stringify(r.ranges)} left the viewport flat: ` +
        `spread ${r.spread} (min ${MIN_SPREAD})`,
    ),
  ...problems,
]
console.log(JSON.stringify({ results, failures }, null, 2))
process.exit(failures.length > 0 ? 1 : 0)
