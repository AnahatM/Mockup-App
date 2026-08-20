/**
 * Proves the light-gizmo correction end to end, from real canvas pixels:
 *
 *  (a) toggling the toolbar's "light markers" button actually shows and
 *      hides something in the viewport;
 *  (b) an exported PNG is byte-identical whether gizmos are on or off when
 *      the export button is pressed — the single most important guarantee
 *      in this task, since a gizmo leaking into an export would be a
 *      serious, silent bug.
 *
 * Uses `domcontentloaded` + a fixed settle delay rather than `networkidle0`:
 * the Vite dev server keeps a persistent HMR websocket open, which means
 * "network idle" never actually arrives.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = process.env.APP_URL ?? 'http://localhost:5173/studio'
const DOWNLOAD_DIR = resolve('scripts/out/gizmo-downloads')

if (existsSync(DOWNLOAD_DIR)) rmSync(DOWNLOAD_DIR, { recursive: true })
mkdirSync(DOWNLOAD_DIR, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'shell',
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--window-size=1600,1000',
  ],
})

const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 })
const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && problems.push(`[error] ${m.text()}`))

const client = await page.createCDPSession()
await client.send('Browser.setDownloadBehavior', {
  behavior: 'allow',
  downloadPath: DOWNLOAD_DIR,
  eventsEnabled: true,
})

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
await settle(3500)
await page.waitForSelector('canvas', { timeout: 20_000 })
await settle(1500)

const canvasClip = await page.evaluate(() => {
  const el = document.querySelector('canvas')
  const r = el.getBoundingClientRect()
  return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }
})

// --- (a) toggling the toolbar button shows and hides gizmos ---------------

const before = await page.screenshot({ clip: canvasClip })
await clickByAria(page, 'Show light markers')
await settle(500)
const on = await page.screenshot({ clip: canvasClip })
await clickByAria(page, 'Hide light markers')
await settle(500)
const off = await page.screenshot({ clip: canvasClip })

const onDiffersFromBefore = countDiffering(before, on) > 0
const offMatchesBefore = countDiffering(before, off) === 0

// --- (b) an export is identical whether gizmos are on or off --------------

await clickByRole(page, 'tab', 'Export')
await settle(400)

await clickByAria(page, 'Show light markers')
await settle(300)
const hashGizmosOn = await exportAndHash(page)

await clickByAria(page, 'Hide light markers')
await settle(300)
const hashGizmosOff = await exportAndHash(page)

const exportsAreIdentical = hashGizmosOn !== null && hashGizmosOn === hashGizmosOff

await browser.close()

console.log(
  JSON.stringify(
    {
      toggle: {
        onDiffersFromBefore,
        offMatchesBefore,
        pass: onDiffersFromBefore && offMatchesBefore,
      },
      exportIdentity: {
        hashGizmosOn,
        hashGizmosOff,
        pass: exportsAreIdentical,
      },
      problems,
    },
    null,
    2,
  ),
)

// ---------------------------------------------------------------------------

async function exportAndHash(pageRef) {
  // The export always downloads as the same filename, so Chrome would silently
  // overwrite rather than add a "(1)" suffix — clearing the directory first
  // means "a .png exists" is unambiguous proof of *this* export, not a stale one.
  rmSync(DOWNLOAD_DIR, { recursive: true, force: true })
  mkdirSync(DOWNLOAD_DIR, { recursive: true })
  await clickByText(pageRef, 'Export PNG')
  const file = await waitForFile(15_000)
  if (!file) return null
  return createHash('sha256').update(readFileSync(resolve(DOWNLOAD_DIR, file))).digest('hex')
}

async function waitForFile(timeoutMs) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const files = readdirSync(DOWNLOAD_DIR).filter(
      (f) => f.endsWith('.png') && !f.endsWith('.crdownload'),
    )
    if (files.length) return files[0]
    await settle(200)
  }
  return null
}

function countDiffering(a, b) {
  if (a.length !== b.length) return Math.max(a.length, b.length)
  let diff = 0
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) diff += 1
  return diff
}

async function clickByAria(pageRef, label) {
  const handle = await pageRef.evaluateHandle(
    (l) => [...document.querySelectorAll(`[aria-label="${l}"]`)][0] ?? null,
    label,
  )
  const el = handle.asElement()
  if (!el) throw new Error(`no element with aria-label "${label}"`)
  await el.click()
}

async function clickByRole(pageRef, role, text) {
  const els = await pageRef.$$(`[role="${role}"]`)
  for (const el of els) {
    const t = await el.evaluate((n) => n.textContent?.trim())
    if (t === text) {
      await el.click()
      return
    }
  }
  throw new Error(`no [role="${role}"] with text "${text}"`)
}

async function clickByText(pageRef, text) {
  const buttons = await pageRef.$$('button')
  for (const button of buttons) {
    const label = await button.evaluate((el) => el.textContent)
    if (label?.includes(text)) {
      await button.click()
      return
    }
  }
  throw new Error(`button "${text}" not found`)
}

function settle(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
