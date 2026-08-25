/**
 * Contact sheets of the 3D viewport across environments, cameras and devices.
 *
 * A reviewing tool rather than a pass/fail one — `verify-structure-extremes`
 * covers what can be reduced to a number, and this covers everything that
 * cannot: geometry poking through a device, a backdrop edge in frame, a seam
 * where two surfaces meet, a scene that is technically drawing and still looks
 * wrong. Those are only findable by looking, so this makes looking cheap: one
 * PNG grid per sweep instead of a hundred separate screenshots.
 *
 * Composited in the page rather than on disk, because the alternative is an
 * image library and the whole point of this project is not having one.
 *
 * Run against a static build: `npm run build && npx vite preview --port 4173`.
 *   node scripts/shoot-matrix.mjs environments
 *   node scripts/shoot-matrix.mjs cameras
 *   node scripts/shoot-matrix.mjs devices
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const PORT = process.env.PORT ?? '4173'
const SWEEP = process.argv[2] ?? 'environments'

/** Cell size in the contact sheet. Small enough to fit a dozen, big enough
 *  that a tile intersecting a device is visible. */
const CELL = { width: 620, height: 440 }

/**
 * Restated from `structureSchema`, and applied before every cell.
 *
 * Switching the environment kind does not reset the geometry config it shares
 * with the other kinds, so without this a `Tile size` set by one cell silently
 * stays set for every cell after it — and the sheet shows nine pictures under
 * labels describing settings that were not in force when they were taken. Cost
 * me a wrong diagnosis of the room before I noticed.
 */
const DEFAULTS = {
  Size: 8,
  'Tile size': 0.55,
  Gap: 0.12,
  Depth: 0.16,
  Relief: 0.5,
  'Pulse height': 0.45,
  'Pulse speed': 0.25,
  'Wall height': 7,
}

const SWEEPS = {
  environments: {
    columns: 3,
    cells: [
      { label: 'none', env: 'none' },
      { label: 'hex', env: 'hex' },
      { label: 'tiles', env: 'tiles' },
      { label: 'room', env: 'room' },
      { label: 'blocks', env: 'blocks' },
      { label: 'blocks, deep', env: 'blocks', ranges: { Depth: 1.4, 'Pulse height': 2 } },
      { label: 'hex, coarse', env: 'hex', ranges: { 'Tile size': 2, Size: 14 } },
      { label: 'tiles, tight', env: 'tiles', ranges: { 'Tile size': 0.2, Gap: 0.02 } },
      { label: 'room, small', env: 'room', ranges: { Size: 2 } },
    ],
  },
  cameras: {
    columns: 3,
    // Every angle preset, over the environment most likely to intersect.
    // Angle is a `choice` control, so these are preset ids and not labels.
    cells: [
      'front',
      'hero',
      'three-quarter',
      'low-hero',
      'top-down',
      'floating',
      'dutch',
      'macro',
      'profile',
    ].map((preset) => ({ label: preset, env: 'blocks', camera: preset })),
  },
  details: {
    columns: 2,
    // Close enough to judge the parts a wide shot only hints at: the keyboard
    // layout, the trackpad, the strap loop, the stand, the camera bump.
    cells: [
      { label: 'laptop deck', env: 'none', device: 'Pro Laptop 14"', camera: 'top-down' },
      { label: 'laptop hero', env: 'none', device: 'Pro Laptop 14"', camera: 'low-hero' },
      { label: 'watch', env: 'none', device: 'Watch 45mm', camera: 'three-quarter' },
      { label: 'watch profile', env: 'none', device: 'Watch 45mm', camera: 'profile' },
      { label: 'monitor stand', env: 'none', device: 'Monitor 27"', camera: 'low-hero' },
      { label: 'all-in-one', env: 'none', device: 'All-in-one 24"', camera: 'three-quarter' },
      { label: 'screen macro', env: 'none', device: 'All-in-one 24"', camera: 'front' },
      { label: 'phone front', env: 'none', device: 'Pro Phone 6.1"', camera: 'front' },
      { label: 'phone underside', env: 'none', device: 'Pro Phone 6.1"', camera: 'low-hero' },
      { label: 'phone back', env: 'none', device: 'Pro Phone 6.1"', camera: 'profile' },
      { label: 'fold crease', env: 'none', device: 'Fold (open)', camera: 'hero' },
      { label: 'flip crease', env: 'none', device: 'Flip (open)', camera: 'three-quarter' },
    ],
  },
  devices: {
    columns: 3,
    // Size is the axis that breaks things: a watch and a monitor differ by an
    // order of magnitude and the environment has to suit both.
    cells: [
      'Watch 45mm',
      'Pro Phone 6.1"',
      'Flip (open)',
      'Tablet Pro 13"',
      'Pro Laptop 14"',
      'Monitor 27"',
    ].map((device) => ({ label: device, env: 'blocks', device })),
  },
}

const sweep = SWEEPS[SWEEP]
if (!sweep) {
  console.error(`unknown sweep "${SWEEP}"; try ${Object.keys(SWEEPS).join(', ')}`)
  process.exit(1)
}

mkdirSync('scripts/out', { recursive: true })

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

await page.setViewport({ width: 1400, height: 900 })
await page.goto(`http://localhost:${PORT}/studio`, { waitUntil: 'load', timeout: 60_000 })
await page.waitForSelector('canvas', { timeout: 60_000 })
await wait(4500)

async function openTab(name) {
  const tabs = await page.$$('[role="tab"]')
  const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
  const index = labels.findIndex((l) => l?.includes(name))
  if (index >= 0) await tabs[index].click()
  await wait(450)
}

/**
 * Opens every collapsed panel in the current tab.
 *
 * The inspector ships most panels collapsed, so the camera angle presets are
 * not in the DOM until their section is opened — a click-by-text for "Dutch"
 * simply finds nothing and reports the preset missing, which is not what is
 * wrong.
 */
const expandAll = async () => {
  await page.evaluate(() => {
    for (const button of document.querySelectorAll('button[aria-expanded="false"]')) {
      button.click()
    }
  })
  await wait(400)
}

/** Visible buttons only: a closed `<dialog>`'s Cancel and Confirm are in the
 *  document from first paint and would otherwise match and silently do
 *  nothing. */
const clickByText = (text) =>
  page.evaluate((t) => {
    const button = [...document.querySelectorAll('button')].find(
      (b) => b.textContent?.trim() === t && b.getBoundingClientRect().width > 0,
    )
    if (!button) return false
    button.click()
    return true
  }, text)

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

const setSelect = (label, value) =>
  page.evaluate(
    ([l, v]) => {
      const el = document.querySelector(`select[aria-label="${l}"]`)
      if (!el) return false
      const setter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        'value',
      ).set
      setter.call(el, v)
      el.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    },
    [label, value],
  )

/** The viewport as a data URL, cropped to the canvas itself. */
const grab = () =>
  page.evaluate((cell) => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = cell.width
    off.height = cell.height
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0, cell.width, cell.height)
    return off.toDataURL('image/png')
  }, CELL)

const shots = []
for (const cell of sweep.cells) {
  if (cell.device) {
    await openTab('Device')
    await expandAll()
    if (!(await clickByText(cell.device))) problems.push(`no device "${cell.device}"`)
    await wait(1400)
  }

  await openTab('Scene')
  await expandAll()
  if (!(await setSelect('Environment', cell.env))) {
    problems.push('no Environment select found')
  }
  await wait(500)
  // Defaults first, then this cell's overrides, so no cell inherits the last.
  for (const [label, value] of Object.entries({ ...DEFAULTS, ...(cell.ranges ?? {}) })) {
    // A slider absent for this kind is not a problem: the room has no pulse.
    await setRange(label, value)
  }

  if (cell.camera) {
    await openTab('Camera')
    await expandAll()
    if (!(await setSelect('Angle', cell.camera))) {
      problems.push(`no camera "${cell.camera}"`)
    }
    await wait(1200)
  }

  await wait(1300)
  shots.push({ label: cell.label, data: await grab() })
}

/** Stitch the cells into one labelled grid, in the page. */
const sheet = await page.evaluate(
  async ([shots, columns, cell]) => {
    const rows = Math.ceil(shots.length / columns)
    const pad = 26
    const canvas = document.createElement('canvas')
    canvas.width = columns * cell.width
    canvas.height = rows * (cell.height + pad)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#101014'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (const [i, shot] of shots.entries()) {
      const x = (i % columns) * cell.width
      const y = Math.floor(i / columns) * (cell.height + pad)
      const image = new Image()
      await new Promise((resolve) => {
        image.onload = resolve
        image.src = shot.data
      })
      ctx.drawImage(image, x, y + pad)
      ctx.fillStyle = '#f2f0ec'
      ctx.font = '600 15px system-ui, sans-serif'
      ctx.textBaseline = 'middle'
      ctx.fillText(shot.label, x + 10, y + pad / 2)
    }
    return canvas.toDataURL('image/png')
  },
  [shots, sweep.columns, CELL],
)

const path = `scripts/out/sheet-${SWEEP}.png`
const { writeFileSync } = await import('node:fs')
writeFileSync(path, Buffer.from(sheet.split(',')[1], 'base64'))

await browser.close()
console.log(JSON.stringify({ sheet: path, cells: shots.length, problems }, null, 2))
process.exit(problems.length > 0 ? 1 : 0)
