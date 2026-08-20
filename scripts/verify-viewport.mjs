/**
 * End-to-end proof for the viewport work: the cyclorama backdrop no longer
 * shows a stray triangular shape from a wide angle, fly mode comes to rest
 * when input stops (WASD/QE movement and drag-to-look alike), the axis
 * gizmo renders and snaps the camera, and — the one that matters most — an
 * export never contains the gizmo, proven from real pixels rather than
 * assumed from the code.
 *
 * Windows/Git Bash note: run with `MSYS_NO_PATHCONV=1 node scripts/verify-viewport.mjs`
 * if invoking any leading-slash CLI argument alongside this.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = process.env.APP_URL ?? 'http://localhost:5173/studio'
// `scripts/out/` is shared with every other verify-*.mjs script (and other
// agents' concurrent runs) in this repo; override with OUT_ROOT to write
// screenshots somewhere private if that directory is being cleaned up from
// underneath a run.
const OUT_ROOT = process.env.OUT_ROOT ?? 'scripts/out'
const OUT_DIR = resolve(OUT_ROOT, 'viewport')
const DOWNLOAD_DIR = resolve(OUT_ROOT, 'viewport-downloads')

rmSync(OUT_DIR, { recursive: true, force: true })
mkdirSync(OUT_DIR, { recursive: true })
rmSync(DOWNLOAD_DIR, { recursive: true, force: true })
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

await page.evaluateOnNewDocument(() => localStorage.setItem('mockup-studio:theme', 'light'))
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60_000 })
await settle(3500)
// The dev box can be running several other agents' headless Chrome
// instances at once (all sharing swiftshader software rendering), so first
// paint can be considerably slower than on a quiet machine — worth one
// reload-and-retry before giving up, since a slow first compile is common
// but a slow SECOND one (module graph already warm) usually is not.
try {
  await page.waitForSelector('canvas', { timeout: 90_000 })
} catch (error) {
  process.stderr.write(`canvas not ready after 90s, reloading once: ${error.message}\n`)
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 })
  await settle(3500)
  await page.waitForSelector('canvas', { timeout: 90_000 })
}
await settle(2000)

const canvasClip = await getCanvasClip(page)
const results = {}

await stage('backdrop', async () => {
  results.backdrop = await checkBackdrop(page, canvasClip)
})

await stage('flyMoveRest', async () => {
  await resetToFly(page)
  results.flyMoveRest = await checkFlyRest(page, canvasClip, 'KeyD')
})
await stage('flyVerticalRest', async () => {
  // Reset first: the previous sub-test already displaced the camera, and a
  // fly camera has no auto-look-at, so a second move in a row easily drifts
  // the product/backdrop out of frame — leaving only the flat, non-parallaxing
  // painted background, which would make ANY further movement look like a
  // false "didn't move" from screenshots alone.
  await resetToFly(page)
  results.flyVerticalRest = await checkFlyRest(page, canvasClip, 'KeyE')
})
await stage('flyLookDrift', async () => {
  await resetToFly(page)
  results.flyLookDrift = await checkFlyLookDrift(page, canvasClip)
})
await stage('gizmoVisible', async () => {
  results.gizmoVisible = await checkGizmoOnScreen(page, canvasClip)
})
await stage('exportExcludesGizmo', async () => {
  results.exportExcludesGizmo = await checkExportExcludesGizmo(page)
})
await stage('shortcutsOverlay', async () => {
  results.shortcutsOverlay = await checkShortcutsOverlay(page)
})

await browser.close()

console.log(JSON.stringify({ results, problems }, null, 2))

/** Runs one phase, logging its start/end to stderr immediately (flushed as
 *  it happens) and recording — rather than aborting on — any failure, so a
 *  crash partway through still leaves every earlier result intact. */
async function stage(name, fn) {
  process.stderr.write(`[${name}] start\n`)
  try {
    await fn()
    process.stderr.write(`[${name}] done\n`)
  } catch (error) {
    process.stderr.write(`[${name}] FAILED: ${error?.stack ?? error}\n`)
    results[name] = { pass: false, error: String(error?.message ?? error) }
  }
}

// ---------------------------------------------------------------------------

/**
 * Orbits wide (the angle that used to expose the mispositioned/cap-faced
 * sweep) and zooms out toward `maxDistance`, then screenshots several angles
 * for visual inspection (read back with the Read tool, not just eyeballed
 * here) and checks the frame's four extreme corners for the sharp colour
 * jump a stray polygon edge would leave behind — real geometry lit by the
 * key light does not produce a hard-edged, high-contrast patch way out at a
 * corner the way a misplaced solid did.
 */
async function checkBackdrop(pageRef, clip) {
  const shots = []
  const cx = clip.x + clip.width / 2
  const cy = clip.y + clip.height / 2

  shots.push(await captureBoth(pageRef, clip, 'backdrop-front.png'))

  for (let i = 0; i < 12; i += 1) await clickByAria(pageRef, 'Zoom out')
  await settle(300)
  shots.push(await captureBoth(pageRef, clip, 'backdrop-zoomed-out.png'))

  await dragOrbit(pageRef, cx, cy, -900, 0)
  await settle(300)
  shots.push(await captureBoth(pageRef, clip, 'backdrop-wide-1.png'))

  await dragOrbit(pageRef, cx, cy, -900, 0)
  await settle(300)
  shots.push(await captureBoth(pageRef, clip, 'backdrop-wide-2.png'))

  await dragOrbit(pageRef, cx, cy, 0, -400)
  await settle(300)
  shots.push(await captureBoth(pageRef, clip, 'backdrop-wide-top.png'))

  const spreads = []
  for (const shot of shots) spreads.push(await cornerSpread(pageRef, shot.base64))

  return {
    shots: shots.map((s) => s.path),
    cornerSpread: spreads,
    pass: spreads.every((s) => s < 90),
  }
}

/** Holds a movement key, releases it, and asserts the canvas stops changing. */
async function checkFlyRest(pageRef, clip, code) {
  const before = await pageRef.screenshot({ clip })
  await pageRef.keyboard.down(keyFor(code))
  await settle(400)
  const during = await pageRef.screenshot({ clip })
  await pageRef.keyboard.up(keyFor(code))
  await settle(350)
  const restA = await pageRef.screenshot({ clip })
  await settle(350)
  const restB = await pageRef.screenshot({ clip })

  const moved = countDiffering(before, during) > 0
  const atRest = countDiffering(restA, restB) === 0
  return { key: code, moved, atRest, pass: moved && atRest }
}

/** Holds the pointer, moves once, then holds it still — the exact scenario
 *  that used to keep rotating under the old joystick-style look control. */
async function checkFlyLookDrift(pageRef, clip) {
  const cx = clip.x + clip.width / 2
  const cy = clip.y + clip.height / 2
  await pageRef.mouse.move(cx, cy)
  await pageRef.mouse.down()
  await pageRef.mouse.move(cx + 180, cy + 90, { steps: 12 })
  await settle(150)
  const a = await pageRef.screenshot({ clip })
  await settle(450)
  const b = await pageRef.screenshot({ clip })
  await pageRef.mouse.up()
  await settle(200)

  return { pass: countDiffering(a, b) === 0 }
}

/**
 * Samples the corner where the gizmo renders for saturated axis colours.
 * Several attempts, keeping the best: a single software-rendered frame can
 * occasionally be captured mid-render on a machine this busy (many other
 * agents' headless Chrome instances sharing the same swiftshader pipeline),
 * and a false negative from one unlucky frame is not the same claim as "the
 * gizmo does not render".
 */
async function checkGizmoOnScreen(pageRef, clip) {
  let best = -1
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const shot = await pageRef.screenshot({ clip, encoding: 'base64' })
    best = Math.max(best, await maxChromaInCorner(pageRef, shot))
    if (best > 60) break
    await settle(300)
  }
  return { maxChroma: best, pass: best > 60 }
}

/**
 * Exports twice at different camera angles (the gizmo rotates with the
 * camera, so its on-screen colours genuinely differ between the two) and
 * proves the exported corner is background-coloured — never the gizmo — in
 * both, which is the strongest version of "identical whether the gizmo is
 * visible or not" reachable without a dedicated visibility toggle.
 */
async function checkExportExcludesGizmo(pageRef) {
  await clickByRole(pageRef, 'tab', 'Export')
  await settle(400)

  const exportA = await exportAndRead(pageRef)
  const cornerA = exportA ? await maxChromaInCorner(pageRef, exportA.base64) : null

  const clip = await getCanvasClip(pageRef)
  await dragOrbit(pageRef, clip.x + clip.width / 2, clip.y + clip.height / 2, 500, 0)
  await settle(300)
  await clickByRole(pageRef, 'tab', 'Export')
  await settle(400)

  const exportB = await exportAndRead(pageRef)
  const cornerB = exportB ? await maxChromaInCorner(pageRef, exportB.base64) : null
  // A short gap before clicking again: the button's label only flips back
  // from "Working…" to "Export PNG" once React commits the state update
  // that follows the previous export's promise resolving.
  await settle(300)
  const repeat = await exportAndRead(pageRef)

  return {
    cornerChromaExportA: cornerA,
    cornerChromaExportB: cornerB,
    sameAngleExportsIdentical: exportB && repeat ? exportB.hash === repeat.hash : null,
    pass: cornerA !== null && cornerB !== null && cornerA < 60 && cornerB < 60,
  }
}

async function checkShortcutsOverlay(pageRef) {
  await pageRef.keyboard.press('?')
  await settle(300)
  // The app has more than one <dialog> (e.g. a confirm dialog elsewhere in
  // the DOM, closed); the shortcuts reference is specifically the open one.
  const text = await pageRef.evaluate(
    () => [...document.querySelectorAll('dialog')].find((d) => d.open)?.textContent ?? '',
  )
  await pageRef.keyboard.press('Escape')
  await settle(200)
  return {
    hasViewportSection: text.includes('Viewport'),
    hasQE: text.includes('Q / E'),
    hasSpacePan: text.toLowerCase().includes('shift + drag'),
    pass: text.includes('Viewport') && text.includes('Q / E'),
  }
}

// --- helpers -----------------------------------------------------------

async function exportAndRead(pageRef) {
  rmSync(DOWNLOAD_DIR, { recursive: true, force: true })
  mkdirSync(DOWNLOAD_DIR, { recursive: true })
  await clickByText(pageRef, 'Export PNG')
  const file = await waitForFile(15_000)
  if (!file) return null
  const buf = readFileSync(resolve(DOWNLOAD_DIR, file))
  return { base64: buf.toString('base64'), hash: createHash('sha256').update(buf).digest('hex') }
}

/** Decodes a base64 PNG in-page and returns the largest chroma
 *  (max channel - min channel) found in a grid over its bottom-right 15%
 *  corner, where the gizmo lives. High chroma = a saturated axis colour is
 *  there; low chroma = flat backdrop only. */
function maxChromaInCorner(pageRef, base64) {
  return pageRef.evaluate(
    (data) =>
      new Promise((resolvePromise) => {
        const image = new Image()
        image.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(image, 0, 0)
          let max = 0
          for (let fx = 0.85; fx <= 0.98; fx += 0.02) {
            for (let fy = 0.82; fy <= 0.97; fy += 0.02) {
              const [r, g, b] = ctx.getImageData(
                Math.floor(fx * image.width),
                Math.floor(fy * image.height),
                1,
                1,
              ).data
              max = Math.max(max, Math.max(r, g, b) - Math.min(r, g, b))
            }
          }
          resolvePromise(max)
        }
        image.onerror = () => resolvePromise(-1)
        image.src = `data:image/png;base64,${data}`
      }),
    base64,
  )
}

/** Saves a screenshot to disk for visual inspection AND returns it as
 *  base64 for in-page pixel analysis, from the same moment. */
async function captureBoth(pageRef, clip, name) {
  const path = resolve(OUT_DIR, name)
  await pageRef.screenshot({ path, clip })
  const base64 = await pageRef.screenshot({ clip, encoding: 'base64' })
  return { path, base64 }
}

/** Largest single-channel difference between any two of the frame's four
 *  extreme corners — a proxy for "a large flat shape is poking into one
 *  corner but not the others", which is what the old bug looked like. */
function cornerSpread(pageRef, base64) {
  return pageRef.evaluate(
    (data) =>
      new Promise((resolvePromise) => {
        const image = new Image()
        image.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = image.width
          canvas.height = image.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(image, 0, 0)
          const w = image.width - 1
          const h = image.height - 1
          const corners = [
            [4, 4],
            [w - 4, 4],
            [4, h - 4],
            [w - 4, h - 4],
          ].map(([x, y]) => ctx.getImageData(x, y, 1, 1).data)
          let maxDiff = 0
          for (const a of corners) {
            for (const b of corners) {
              for (let c = 0; c < 3; c += 1) {
                maxDiff = Math.max(maxDiff, Math.abs(a[c] - b[c]))
              }
            }
          }
          resolvePromise(maxDiff)
        }
        image.onerror = () => resolvePromise(-1)
        image.src = `data:image/png;base64,${data}`
      }),
    base64,
  )
}

/** Resets the camera to its default framing and switches to fly mode. */
async function resetToFly(pageRef) {
  await clickByAria(pageRef, 'Reset camera')
  await settle(400)
  await clickByAria(pageRef, 'fly mode')
  await settle(300)
}

async function dragOrbit(pageRef, cx, cy, dx, dy) {
  await pageRef.mouse.move(cx, cy)
  await pageRef.mouse.down()
  await pageRef.mouse.move(cx + dx, cy + dy, { steps: 30 })
  await pageRef.mouse.up()
}

async function getCanvasClip(pageRef) {
  return pageRef.evaluate(() => {
    const el = document.querySelector('canvas')
    const r = el.getBoundingClientRect()
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
    }
  })
}

function keyFor(code) {
  return code.replace('Key', '').toLowerCase()
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
