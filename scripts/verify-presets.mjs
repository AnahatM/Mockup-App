/**
 * Verifies the preset system end to end.
 *
 * 1. Change the scene, save a preset, RELOAD the page, apply it — the whole
 *    point of localStorage persistence is surviving a reload.
 * 2. Export the preset to a file and check it is a valid manifest.
 * 3. Feed a deliberately corrupted preset back in and confirm the app rejects it
 *    with a readable message instead of crashing.
 */
import puppeteer from 'puppeteer-core'
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  rmSync,
} from 'node:fs'
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
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))

// --- 1. change the scene, save, reload, re-apply -----------------------------
await openTab(page, 'Scene')
await page.select('select[aria-label="Style"]', 'grid')
await new Promise((r) => setTimeout(r, 600))

await openTab(page, 'Presets')
await typeInto(page, 'Preset name', 'Grid look')
await clickByText(page, 'Save')
await new Promise((r) => setTimeout(r, 800))

const savedCount = await page.evaluate(
  () => JSON.parse(localStorage.getItem('mockup-studio:presets') ?? '[]').length,
)

// Reload, then confirm the preset is still listed and restores the scene.
await page.reload({ waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))

await openTab(page, 'Scene')
const styleAfterReload = await page.evaluate(
  () => document.querySelector('select[aria-label="Style"]')?.value,
)

await openTab(page, 'Presets')
const survived = await page.evaluate(() =>
  [...document.querySelectorAll('button[title^="Apply "]')].map((b) => b.textContent),
)
await clickByText(page, 'Grid look')
await new Promise((r) => setTimeout(r, 800))

await openTab(page, 'Scene')
const styleAfterApply = await page.evaluate(
  () => document.querySelector('select[aria-label="Style"]')?.value,
)

// --- 2. export the preset ----------------------------------------------------
await openTab(page, 'Presets')
const exportButton = await page.$('button[aria-label^="Export "]')
if (exportButton) await exportButton.click()
await new Promise((r) => setTimeout(r, 2500))

const files = readdirSync(DIR).filter((f) => f.endsWith('.json'))
let exported = null
if (files.length) {
  const text = readFileSync(`${DIR}/${files[0]}`, 'utf8')
  const json = JSON.parse(text)
  exported = {
    file: files[0],
    kind: json.kind,
    version: json.version,
    hasScene: Boolean(json.scene?.camera && json.scene?.lighting),
    backdrop: json.scene?.scene?.backdrop?.mode,
  }

  // --- 3. corrupt it and re-import ------------------------------------------
  json.scene.camera.fov = 99999
  writeFileSync(`${DIR}/corrupt.json`, JSON.stringify(json))
}

let rejection = null
if (exported) {
  const fileInput = await page.$('input[accept=".json,application/json"]')
  await fileInput.uploadFile(`${DIR}/corrupt.json`)
  await new Promise((r) => setTimeout(r, 1500))
  rejection = await page.evaluate(
    () => document.querySelector('[role=alert]')?.textContent ?? null,
  )
}

const stillAlive = await page.evaluate(() => Boolean(document.querySelector('canvas')))

await browser.close()
console.log(
  JSON.stringify(
    {
      savedCount,
      styleAfterReload,
      survivedReload: survived,
      styleAfterApply,
      exported,
      rejection,
      stillAlive,
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

/**
 * Two passes, exact before partial. Panel headers are buttons containing their
 * title, so a partial match for "Save" hits the "Saved" panel header first and
 * collapses the panel instead of clicking the button.
 */
async function clickByText(page, text) {
  const buttons = await page.$$('button')
  const labels = await Promise.all(
    buttons.map((b) => b.evaluate((el) => el.textContent?.trim() ?? '')),
  )

  let index = labels.findIndex((label) => label === text)
  if (index < 0) index = labels.findIndex((label) => label.includes(text))
  if (index < 0)
    throw new Error(`button "${text}" not found; saw: ${labels.join(' | ')}`)

  await buttons[index].click()
}

async function typeInto(page, label, value) {
  const input = await page.$(`input[aria-label="${label}"]`)
  if (!input) throw new Error(`input ${label} not found`)
  await input.click()
  await input.type(value)
}
