/**
 * Captures the marketing screenshots used on the site (and the README hero).
 *
 * Committed as generated output rather than hand-taken screenshots, so they can
 * be regenerated after a UI change instead of slowly going stale — a landing
 * page showing a version of the app that no longer exists is worse than one
 * showing a placeholder.
 *
 * Run against a static build (`npm run build && npx vite preview --port 4173`),
 * not the dev server: HMR keeps a socket open and can detach the WebGL frame
 * mid-capture. See verify-showcase.mjs / verify-presets.mjs, whose puppeteer
 * techniques this borrows — the `role="tab"` lookup, the `aria-label` control
 * lookups, and the blob/panel settle timings.
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const PORT = process.env.PORT ?? '4173'
/**
 * The screenshots that go *on* the devices, produced by
 * `make-shot-fixtures.mjs` from this app's own pages.
 *
 * Each device gets the capture shaped like its screen: a phone-width one on a
 * phone, a desktop-width one on a laptop. Putting the wrong one on either is
 * the difference between a mockup and a mockup with bars down the sides.
 */
const FIXTURE = 'scripts/out/shot-phone.png'
const DESKTOP_FIXTURE = 'scripts/out/shot-desktop.png'
const PHONE = 'Pro Phone 6.1"'
const LAPTOP = 'Pro Laptop 14"'

mkdirSync('src/assets/shots', { recursive: true })
mkdirSync('docs/images', { recursive: true })

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

/**
 * Optional comma-separated allow-list, e.g. `SHOTS=hero-studio npm run shots`.
 *
 * Capturing a good screenshot is partly a matter of luck with timing, so once
 * a shot looks right you want to leave it alone and re-roll only the ones that
 * did not. Without this, fixing one bad shot means regenerating all six and
 * hoping the good ones come out as well the second time.
 */
const ONLY = process.env.SHOTS?.split(',')
  .map((s) => s.trim())
  .filter(Boolean)

/**
 * Every marketing shot: pick the phone, put the fixture screenshot on its
 * screen, apply a preset for the look, run any shot-specific steps, then
 * either strip the UI chrome for a full-bleed hero or leave one inspector tab
 * open to show the feature off.
 */
async function shoot({
  name,
  outDir = 'src/assets/shots',
  theme = 'light',
  width,
  height,
  device = PHONE,
  fixture = FIXTURE,
  preset,
  tab,
  hero = false,
  extra,
}) {
  if (ONLY && !ONLY.includes(name)) return null

  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  page.on('pageerror', (e) => problems.push(`${name}: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`${name} [console]: ${m.text()}`)
  })

  await page.evaluateOnNewDocument(
    (t) => localStorage.setItem('mockup-studio:theme', t),
    theme,
  )
  await page.goto(`http://localhost:${PORT}/studio`, {
    waitUntil: 'load',
    timeout: 60_000,
  })
  await page.waitForSelector('canvas', { timeout: 60_000 })
  await wait(4000)

  await selectDevice(page, device)
  await uploadFixture(page, fixture)
  if (preset) await applyPreset(page, preset[0], preset[1])
  if (extra) await extra(page)

  if (hero) {
    await closePanels(page)
  } else if (tab) {
    await openTab(page, tab)
    await wait(800)
  }
  await wait(1500)

  await page.screenshot({ path: `${outDir}/${name}.png`, type: 'png' })
  await page.close()
  return name
}

const made = []

made.push(
  await shoot({
    name: 'hero-studio',
    theme: 'dark',
    width: 1200,
    height: 1600,
    preset: ['Dramatic', 'Dark hero'],
    hero: true,
  }),
)

made.push(
  await shoot({
    name: 'showcase-device',
    theme: 'light',
    width: 1600,
    height: 900,
    preset: ['Studio', 'Glass desk'],
    tab: 'Device',
  }),
)

made.push(
  await shoot({
    name: 'showcase-backdrop',
    theme: 'light',
    width: 1600,
    height: 900,
    preset: ['Studio', 'Clean studio'],
    extra: async (page) => {
      await openTab(page, 'Scene')
      await wait(500)
      await clickFirstAdaptiveSwatch(page)
      await wait(600)
    },
  }),
)

made.push(
  await shoot({
    name: 'showcase-motion',
    theme: 'light',
    width: 1600,
    height: 900,
    preset: ['Motion', 'Floating turntable'],
    extra: async (page) => {
      await openTab(page, 'Animate')
      await wait(600)
      // Pause and pose mid-cycle rather than screenshotting an animation in
      // flight, which risks landing on an awkward in-between frame.
      await setToggle(page, 'Play', false)
      await setRange(page, 'Scrub', 0.55)
      await wait(400)
    },
  }),
)

made.push(
  await shoot({
    name: 'about-procedural',
    theme: 'light',
    width: 1600,
    height: 900,
    preset: ['Studio', 'Soft light'],
    tab: 'Device',
  }),
)

made.push(
  // The README's banner. A portrait phone in a 16:9 frame is mostly empty
  // margin, so this one is the laptop carrying a desktop-shaped capture, on an
  // environment with something in it — a wide shot wants a wide subject.
  await shoot({
    name: 'studio-hero',
    outDir: 'docs/images',
    theme: 'light',
    width: 1600,
    height: 900,
    device: LAPTOP,
    fixture: DESKTOP_FIXTURE,
    preset: ['Environment', 'Hex field'],
    hero: true,
  }),
)

await browser.close()
console.log(JSON.stringify({ made: made.filter(Boolean), problems }, null, 2))

// --- helpers ------------------------------------------------------------

async function openTab(page, name) {
  const tabs = await page.$$('[role="tab"]')
  const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
  const index = labels.findIndex((l) => l?.includes(name))
  if (index >= 0) await tabs[index].click()
}

async function selectDevice(page, deviceName) {
  await page.evaluate((deviceName) => {
    const nav = document.querySelector('nav[aria-label="Device library"]')
    const btn = nav
      ? [...nav.querySelectorAll('button')].find(
          (b) => b.textContent?.trim() === deviceName,
        )
      : null
    btn?.click()
  }, deviceName)
  await wait(600)
}

async function uploadFixture(page, fixture) {
  await openTab(page, 'Screen')
  await wait(400)
  const fileInput = await page.$('input[type=file]')
  if (!fileInput) throw new Error('screen file input not found')
  await fileInput.uploadFile(fixture)
  await wait(2500)
}

/** Expands a collapsible `Panel` by its header title, if it isn't already open. */
async function expandPanel(page, title) {
  await page.evaluate((title) => {
    const btn = [...document.querySelectorAll('button[aria-expanded]')].find(
      (b) => b.textContent?.trim() === title,
    )
    if (btn && btn.getAttribute('aria-expanded') === 'false') btn.click()
  }, title)
  await wait(300)
}

/**
 * Preset buttons render as `name` then `description` back to back with no
 * separator, so an exact match on the visible text never lands — matching on
 * a `startsWith` of just the name is enough since no two preset names share a
 * prefix.
 */
async function clickPresetByName(page, name) {
  const clicked = await page.evaluate((name) => {
    const btn = [...document.querySelectorAll('button')].find((b) =>
      b.textContent?.trim().startsWith(name),
    )
    if (!btn) return false
    btn.click()
    return true
  }, name)
  if (!clicked) throw new Error(`preset "${name}" not found`)
}

async function applyPreset(page, group, name) {
  await openTab(page, 'Presets')
  await wait(500)
  await expandPanel(page, group)
  await clickPresetByName(page, name)
  await wait(700)
}

/** Clicks the first generated swatch in the "Adaptive backdrops" panel — the
 *  gallery derived from the uploaded screenshot's own colours. */
async function clickFirstAdaptiveSwatch(page) {
  await expandPanel(page, 'Adaptive backdrops')
  const clicked = await page.evaluate(() => {
    const header = [...document.querySelectorAll('button[aria-expanded]')].find(
      (b) => b.textContent?.trim() === 'Adaptive backdrops',
    )
    const section = header?.closest('section')
    const swatch = section?.querySelector('button[aria-pressed]')
    if (!swatch) return false
    swatch.click()
    return true
  })
  if (!clicked)
    throw new Error('no adaptive backdrop swatch found — was the fixture uploaded?')
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

/** The `Toggle` component is a real checkbox with the visible label on the
 *  paired `<label aria-label>`, so clicking that toggles it like a user would. */
async function setToggle(page, label, value) {
  await page.evaluate(
    ({ label, value }) => {
      const lab = [...document.querySelectorAll('label[aria-label]')].find(
        (l) => l.getAttribute('aria-label') === label,
      )
      const forId = lab?.getAttribute('for')
      const input = forId ? document.getElementById(forId) : null
      if (input instanceof HTMLInputElement && input.checked !== value) lab.click()
    },
    { label, value },
  )
}

/** Hides the device rail and inspector so the 3D viewport fills the frame —
 *  used for the two hero shots, where the app chrome would only distract. */
async function closePanels(page) {
  await page.evaluate(() => {
    document.querySelector('button[aria-label="Hide device rail"]')?.click()
    document.querySelector('button[aria-label="Hide inspector"]')?.click()
    // The orientation gizmo is an editing aid. Exports strip it automatically;
    // these are page screenshots, so they have to ask.
    document.querySelector('button[aria-label="Hide orientation gizmo"]')?.click()
  })
  await wait(600)
}
