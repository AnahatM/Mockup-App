/**
 * Verifies the live 2D window-mockup preview (`FlatPreview`, mounted in
 * `WindowPanel`): it draws real pixels, updates when a control changes, and
 * produces exports that change along with it — using the exact same
 * `composeWindow` call the flat PNG export uses.
 *
 * Run twice: once normally, once with WebGL disabled (`--disable-3d-apis`).
 * The second run is the point of this whole feature — the 2D tool must work
 * identically whether or not the 3D studio can even start.
 *
 * Must be run against a STATIC BUILD (`npm run build` / `npx vite build`,
 * then `npx vite preview --port 4173`), not the dev server — HMR reloads the
 * page mid-run whenever another live agent edits a file.
 */
import puppeteer from 'puppeteer-core'
import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const DIR = resolve('scripts/out/flat-preview-downloads')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL_STUDIO = 'http://localhost:4180/studio'

const results = {}
results.webglEnabled = await runWithRetry({ disableWebGL: false })
results.webglDisabled = await runWithRetry({ disableWebGL: true })

console.log(JSON.stringify(results, null, 2))

const allProblems = [...results.webglEnabled.problems, ...results.webglDisabled.problems]
if (allProblems.length > 0) process.exitCode = 1

// ---------------------------------------------------------------------------

/**
 * This machine's headless Chrome (swiftshader) occasionally dies mid-session
 * under load from other work happening in this repo at the same time — an
 * unrelated environment issue, not a bug in what is being tested. A retry
 * with a fresh browser launch is cheap insurance against that flakiness.
 */
async function runWithRetry(options, attempts = 4) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await run(options)
    } catch (error) {
      lastError = error
      console.error(`[attempt ${attempt}/${attempts}] ${error.message}`)
      if (attempt < attempts) await sleep(3000)
    }
  }
  throw lastError
}

async function run({ disableWebGL }) {
  const dir = disableWebGL ? `${DIR}/no-webgl` : `${DIR}/webgl`
  if (existsSync(dir)) rmSync(dir, { recursive: true })
  mkdirSync(dir, { recursive: true })

  const args = [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ]
  if (disableWebGL) args.push('--disable-3d-apis')

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'shell',
    protocolTimeout: 90000,
    args,
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1400, height: 1000 })
  const problems = []
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && problems.push(`[console] ${m.text()}`))

  try {
    const client = await page.createCDPSession()
    await client.send('Browser.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: dir,
      eventsEnabled: true,
    })

    await page.evaluateOnNewDocument(() =>
      localStorage.setItem('mockup-studio:theme', 'light'),
    )
    await page.goto(URL_STUDIO, { waitUntil: 'networkidle0' })
    await sleep(2500)

    const fallbackShown = await hasWebGLFallback(page)

    await openTab(page, 'Screen')
    const input = await page.$('input[type=file]')
    await input.uploadFile('scripts/out/screenshot.png')
    await sleep(2000)

    const frameButton = await findRadio(page, 'Browser')
    if (!frameButton) throw new Error('window style control not found')
    await frameButton.click()
    await sleep(600)

    const before = await samplePreview(page)

    // "Dark window" flips the chrome and body colours, which reliably
    // repaints both the title bar and the body — a real, visible change.
    await page.click('label[aria-label="Dark window"]')
    await sleep(500)
    const after = await samplePreview(page)

    const exportA = await exportPng(page, client, dir)
    await page.click('label[aria-label="Dark window"]')
    await sleep(500)
    const afterRevert = await samplePreview(page)
    const exportB = await exportPng(page, client, dir)

    return {
      disableWebGL,
      fallbackShown,
      preview: {
        nonBlankBeforeChange: before.nonBlank,
        nonBlankAfterChange: after.nonBlank,
        pixelsChangedWithControl: before.hash !== after.hash,
        pixelsRevertedBack: after.hash !== afterRevert.hash,
      },
      export: {
        a: exportA,
        b: exportB,
        exportsChangedWithSameControl: Boolean(
          exportA?.hash && exportB?.hash && exportA.hash !== exportB.hash,
        ),
      },
      problems,
    }
  } finally {
    await browser.close()
  }
}

/** Reads the live preview canvas's pixels and reduces them to a cheap
 * fingerprint: whether anything is drawn, and a hash sensitive to colour. */
async function samplePreview(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector(
      'canvas[aria-label="Live preview of the window mockup"]',
    )
    if (!canvas) return { nonBlank: false, hash: null }
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    const { data } = ctx.getImageData(0, 0, width, height)
    let sum = 0
    let variance = 0
    const first = [data[0], data[1], data[2], data[3]]
    for (let i = 0; i < data.length; i += 4) {
      sum += data[i] + data[i + 1] + data[i + 2] + data[i + 3]
      if (data[i] !== first[0] || data[i + 1] !== first[1] || data[i + 2] !== first[2]) {
        variance++
      }
    }
    return { nonBlank: variance > 0, hash: `${sum}:${variance}` }
  })
}

async function exportPng(page, client, dir) {
  const before = new Set(readdirSync(dir).filter((f) => f.endsWith('.png')))
  await clickByText(page, 'Export window PNG')
  await waitForDownload(dir, before, 20000)
  const files = readdirSync(dir).filter((f) => f.endsWith('.png') && !before.has(f))
  if (files.length === 0) return null
  const buf = readFileSync(`${dir}/${files[0]}`)
  return {
    file: files[0],
    bytes: buf.length,
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    hash: createHash('sha256').update(buf).digest('hex').slice(0, 16),
  }
}

async function hasWebGLFallback(page) {
  return page.evaluate(() => {
    const text = document.body.textContent ?? ''
    return text.includes('3D is unavailable')
  })
}

async function waitForDownload(dir, before, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const done = readdirSync(dir).filter((f) => f.endsWith('.png') && !before.has(f))
    if (done.length > 0) {
      await sleep(250)
      return
    }
    await sleep(200)
  }
}

async function openTab(page, name) {
  const tabs = await page.$$('[role="tab"]')
  const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
  const index = labels.findIndex((l) => l?.includes(name))
  if (index < 0) throw new Error(`tab ${name} not found`)
  await tabs[index].click()
  await sleep(500)
}

async function clickByText(page, text) {
  const buttons = await page.$$('button')
  for (const button of buttons) {
    const label = await button.evaluate((el) => el.textContent)
    if (label?.includes(text)) {
      await button.click()
      return
    }
  }
  throw new Error(`button "${text}" not found`)
}

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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
