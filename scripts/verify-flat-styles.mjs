/**
 * Verifies the flat window's new container styles, shadow presets, and the
 * "hide mockup" toggle: for each, export a flat PNG and prove the pixels
 * actually changed (a style that silently does nothing is the likely bug).
 *
 * Each style gets its own browser launch rather than sharing one session.
 * This machine's headless Chrome (swiftshader) is prone to dying mid-session
 * under load — an unrelated environment issue — and an isolated launch per
 * style means one crash cannot take out the whole run.
 */
import puppeteer from 'puppeteer-core'
import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

// `group` scopes the radio lookup to the right `role="radiogroup"` — "None"
// is a valid option in both Frame and Shadow, so matching by text alone can
// click the wrong control.
const CASES = [
  ...['Default', 'Glass light', 'Glass dark', 'Inset light', 'Inset dark', 'Outline', 'Border'].map(
    (name) => ({ label: `container-${slug(name)}`, kind: 'radio', group: 'Container style', target: name }),
  ),
  ...['None', 'Spread', 'Hug', 'Adaptive'].map((name) => ({
    label: `shadow-${slug(name)}`,
    kind: 'radio',
    group: 'Shadow',
    target: name,
  })),
  ...['Sharp', 'Round'].map((name) => ({
    label: `shape-${slug(name)}`,
    kind: 'radio',
    group: 'Border shape',
    target: name,
  })),
  { label: 'hide-mockup', kind: 'toggle', target: 'Hide mockup' },
]

const results = {}
const problems = []
for (const testCase of CASES) {
  results[testCase.label] = await captureCase(testCase)
}

const hashes = Object.values(results).map((r) => r?.hash)
const nonNull = hashes.filter(Boolean)
const uniqueHashes = new Set(nonNull)
console.log(
  JSON.stringify(
    {
      results,
      totalExports: hashes.length,
      succeeded: nonNull.length,
      uniqueOutputs: uniqueHashes.size,
      allSucceededDistinct: uniqueHashes.size === nonNull.length,
      problems,
    },
    null,
    2,
  ),
)

/** Launches an isolated browser, applies one control change, and exports. */
async function captureCase({ label, kind, group, target }) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const dir = resolve(`scripts/out/downloads-${slug(label)}`)
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
    try {
      const page = await browser.newPage()
      await page.setViewport({ width: 1400, height: 1000 })
      const local = []
      page.on('pageerror', (e) => local.push(`[pageerror] ${e.message}`))
      page.on('console', (m) => m.type() === 'error' && local.push(`[error] ${m.text()}`))

      const client = await page.createCDPSession()
      await client.send('Browser.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: dir,
        eventsEnabled: true,
      })
      await page.evaluateOnNewDocument(() =>
        localStorage.setItem('mockup-studio:theme', 'light'),
      )

      // networkidle0 never resolves here — Vite's HMR websocket stays open —
      // so `load` plus a settle delay is used instead.
      await page.goto('http://localhost:5173/studio', { waitUntil: 'load', timeout: 30000 })
      await new Promise((r) => setTimeout(r, 3000))

      await openTab(page, 'Screen')
      const input = await page.$('input[type=file]')
      await input.uploadFile('scripts/out/screenshot.png')
      await new Promise((r) => setTimeout(r, 2200))

      if (local.some((p) => p.includes('Studio crashed'))) {
        throw new Error('studio crashed on upload (unrelated PalettePicker race)')
      }

      await clickRadio(page, 'Frame', 'Browser')
      await new Promise((r) => setTimeout(r, 500))

      if (kind === 'radio') await clickRadio(page, group, target)
      else await clickToggleByLabel(page, target)
      await new Promise((r) => setTimeout(r, 600))

      const digest = await exportAndDigest(page, dir)
      problems.push(...local)
      return digest
    } catch (e) {
      console.error(`case "${label}" attempt ${attempt} failed:`, e.message)
    } finally {
      await browser.close().catch(() => {})
    }
  }
  return null
}

async function exportAndDigest(page, dir) {
  if (existsSync(dir)) rmSync(dir, { recursive: true })
  mkdirSync(dir, { recursive: true })

  await clickByText(page, 'Export window PNG')
  await waitForDownload(dir, 12000)

  const files = readdirSync(dir).filter((f) => f.endsWith('.png'))
  if (!files.length) throw new Error('export produced no file')

  const buf = readFileSync(`${dir}/${files[0]}`)
  return { bytes: buf.length, hash: createHash('sha256').update(buf).digest('hex').slice(0, 16) }
}

async function waitForDownload(dir, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (readdirSync(dir).filter((f) => f.endsWith('.png')).length > 0) {
      await new Promise((r) => setTimeout(r, 250))
      return
    }
    await new Promise((r) => setTimeout(r, 200))
  }
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
  const deadline = Date.now() + 4000
  while (Date.now() < deadline) {
    const clicked = await page.evaluate((wanted) => {
      const button = [...document.querySelectorAll('button')].find((b) =>
        b.textContent?.includes(wanted),
      )
      if (!button) return false
      button.click()
      return true
    }, text)
    if (clicked) return
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`button "${text}" not found`)
}

async function clickToggleByLabel(page, label) {
  const deadline = Date.now() + 4000
  while (Date.now() < deadline) {
    const clicked = await page.evaluate((wanted) => {
      const el = document.querySelector(`label[aria-label="${wanted}"]`)
      if (!el) return false
      el.click()
      return true
    }, label)
    if (clicked) return
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`toggle "${label}" not found`)
}

/**
 * Finds a segmented-control option by its accessible name and clicks it.
 *
 * Scoped to the `role="radiogroup"` whose own accessible name is `group` —
 * some option labels (like "None") are shared by more than one segmented
 * control (Frame and Shadow both have one), so matching by option text alone
 * can click the wrong control.
 */
async function clickRadio(page, group, name) {
  const deadline = Date.now() + 4000
  while (Date.now() < deadline) {
    const clicked = await page.evaluate(
      ({ wantedGroup, wantedName }) => {
        const groupEl = [...document.querySelectorAll('[role="radiogroup"]')].find(
          (el) => el.getAttribute('aria-label') === wantedGroup,
        )
        if (!groupEl) return false
        const match = [...groupEl.querySelectorAll('[role="radio"]')].find(
          (el) =>
            el.getAttribute('aria-label') === wantedName || el.textContent?.trim() === wantedName,
        )
        if (!match) return false
        match.click()
        return true
      },
      { wantedGroup: group, wantedName: name },
    )
    if (clicked) return
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`radio "${name}" in group "${group}" not found`)
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}
