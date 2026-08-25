/**
 * Proves the responsive pass actually works, at real device sizes.
 *
 * For every route, at phone/tablet/desktop viewports: screenshots the page,
 * asserts there is no horizontal overflow (on the document and on every
 * individual element), and — on `/studio` at phone size — asserts the canvas
 * has a sensible size and that the device rail and inspector can each be
 * opened and closed.
 *
 * Modelled on scripts/shoot-page.mjs for the puppeteer launch flags this
 * project needs under Windows/swiftshader.
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const OUT = 'scripts/out/responsive'
/** Defaults to the dev server; set PORT=4173 to run it against a static build. */
const PORT = process.env.PORT ?? '5173'
mkdirSync(OUT, { recursive: true })

const VIEWPORTS = [
  // A small phone rather than a typical one: 360px is where a layout that only
  // ever gets checked at 390 falls over, and plenty of Androids are 360.
  { name: 'small-phone', width: 360, height: 780 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1440, height: 900 },
]

const ROUTES = [
  '/',
  '/studio',
  '/window',
  '/docs',
  '/docs/quick-start',
  '/about',
  '/privacy',
  '/sitemap',
  // Every layout has to survive the route nobody plans for.
  '/this-route-does-not-exist',
]

/**
 * Both themes, because half the tokens only exist in one of them and a
 * contrast or overflow bug can live in the other for months. The theme is
 * seeded into localStorage before the page's first paint rather than toggled
 * afterwards, so nothing is measured mid-transition.
 */
const THEMES = ['light', 'dark']

let browser = await launchBrowser()

async function launchBrowser() {
  return puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'shell',
    args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  })
}

async function relaunchBrowser() {
  console.error('browser connection lost — relaunching')
  try {
    await browser.close()
  } catch {
    // Already gone — nothing to clean up.
  }
  browser = await launchBrowser()
}

const results = []

for (const theme of THEMES) {
  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      results.push(await withPageRetry(viewport, route, theme))
    }
  }
}

await browser.close()

const failures = results.filter((r) => r.problems.length > 0)
console.log(JSON.stringify({ results, failureCount: failures.length }, null, 2))
if (failures.length > 0) process.exitCode = 1

/**
 * This is a shared machine — many other agents are running their own Chrome
 * instances against this same dev server at once, and a concurrent HMR reload
 * or a resource-starved crash can take out a frame, a page or occasionally
 * the whole browser connection mid-check. None of that reflects on the app
 * itself, so this retries generously (with backoff, and a fresh page or
 * browser as needed) rather than letting the whole run go down over it.
 */
async function withPageRetry(viewport, route, theme) {
  const attempts = 4
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await checkRoute(viewport, route, theme)
    } catch (err) {
      lastError = err
      console.error(
        `attempt ${attempt}/${attempts} for ${theme} ${viewport.name} ${route} failed: ${err.message}`,
      )
      await new Promise((r) => setTimeout(r, 1500 * attempt))
      if (!browser.connected) await relaunchBrowser()
    }
  }
  return {
    theme,
    viewport: viewport.name,
    route,
    file: null,
    innerWidth: viewport.width,
    scrollWidth: null,
    studio: null,
    problems: [`gave up after ${attempts} attempts: ${lastError.message}`],
  }
}

async function checkRoute(viewport, route, theme) {
  const page = await browser.newPage()
  await page.evaluateOnNewDocument(
    (t) => localStorage.setItem('mockup-studio:theme', t),
    theme,
  )
  await page.setViewport({ width: viewport.width, height: viewport.height })
  page.setDefaultNavigationTimeout(60000)
  const problems = []
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && problems.push(`[console] ${m.text()}`))

  // `networkidle0` can hang forever alongside a live Vite HMR websocket, so
  // wait for `load` and then settle explicitly instead.
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' })
  const heavy = route === '/studio' || route === '/window'
  await new Promise((r) => setTimeout(r, heavy ? 2800 : 800))

  const overflow = await measureOverflow(page)
  if (overflow.documentOverflow > 0) {
    problems.push(`document overflows by ${overflow.documentOverflow}px`)
  }
  for (const el of overflow.offenders) {
    problems.push(`element overflows: <${el.tag} class="${el.cls}"> right edge ${el.right} > ${viewport.width}`)
  }

  let studio = null
  if (route === '/studio' && viewport.name === 'phone' && theme === 'light') {
    studio = await checkStudioPhone(page)
    problems.push(...studio.problems)
  }

  const safeRoute = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_/, '')
  const file = `${OUT}/${theme}-${viewport.name}-${safeRoute}.png`
  await page.screenshot({ path: file, fullPage: false })

  await page.close()
  return {
    theme,
    viewport: viewport.name,
    route,
    file,
    innerWidth: viewport.width,
    scrollWidth: overflow.scrollWidth,
    studio,
    problems,
  }
}

/** Document-level overflow, plus every element whose right edge sticks out
 *  past the viewport (excluding sub-pixel rounding noise) — skipping an
 *  element that an ancestor already clips (`overflow-x` other than
 *  `visible`), since a decorative element deliberately bleeding past its own
 *  box and being clipped by a parent is by design, not a layout bug. */
async function measureOverflow(page) {
  return page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth
    const documentOverflow = Math.max(0, scrollWidth - window.innerWidth)
    const clippedByAncestor = (el) => {
      for (let node = el.parentElement; node; node = node.parentElement) {
        if (getComputedStyle(node).overflowX !== 'visible') return true
      }
      return false
    }
    const offenders = []
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0) continue
      if (rect.right > window.innerWidth + 1 && !clippedByAncestor(el)) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: typeof el.className === 'string' ? el.className.slice(0, 40) : '',
          right: Math.round(rect.right),
        })
      }
      if (offenders.length >= 5) break
    }
    return { scrollWidth, documentOverflow, offenders }
  })
}

/** Studio-specific assertions at phone size: the canvas is visible with a
 *  sensible size, and the rail/inspector overlays open and close. */
async function checkStudioPhone(page) {
  const problems = []

  const canvas = await page.evaluate(() => {
    const el = document.querySelector('canvas')
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return { width: Math.round(rect.width), height: Math.round(rect.height) }
  })
  if (!canvas) problems.push('no <canvas> found')
  else if (canvas.width < 100 || canvas.height < 100) {
    problems.push(`canvas too small: ${canvas.width}x${canvas.height}`)
  }

  const rail = await togglePanel(page, 'Show device rail', 'Hide device rail', 'Devices')
  problems.push(...rail.problems)
  const inspector = await togglePanel(page, 'Show inspector', 'Hide inspector', 'Inspector')
  problems.push(...inspector.problems)

  return { canvas, rail, inspector, problems }
}

/**
 * Confirms a panel can be opened and closed via its toolbar toggle.
 *
 * Both panels default to open (see state/slices/ui.ts), so this does not
 * assume a starting state — it reads which of the two toggle labels is
 * currently rendered, drives it closed if it was open, then exercises a full
 * open -> close cycle from there.
 */
async function togglePanel(page, openLabel, closeLabel, asideLabel) {
  const problems = []

  if (await elementExists(page, closeLabel)) {
    await clickByAriaLabel(page, closeLabel)
    await new Promise((r) => setTimeout(r, 300))
  }
  if (await asideVisible(page, asideLabel)) problems.push(`"${asideLabel}" did not close`)

  const opened = await clickByAriaLabel(page, openLabel)
  if (!opened) {
    problems.push(`toggle button "${openLabel}" not found`)
    return { problems }
  }
  await new Promise((r) => setTimeout(r, 300))
  const visibleAfterOpen = await asideVisible(page, asideLabel)
  if (!visibleAfterOpen) problems.push(`"${asideLabel}" did not open`)

  const closed = await clickByAriaLabel(page, closeLabel)
  if (!closed) problems.push(`toggle button "${closeLabel}" not found`)
  await new Promise((r) => setTimeout(r, 300))
  const visibleAfterClose = await asideVisible(page, asideLabel)
  if (visibleAfterClose) problems.push(`"${asideLabel}" did not close`)

  return { problems, visibleAfterOpen, visibleAfterClose }
}

async function elementExists(page, label) {
  return (await page.$(`[aria-label="${label}"]`)) !== null
}

async function clickByAriaLabel(page, label) {
  const handle = await page.$(`[aria-label="${label}"]`)
  if (!handle) return false
  await handle.click()
  return true
}

async function asideVisible(page, label) {
  return page.evaluate((label) => {
    const el = document.querySelector(`aside[aria-label="${label}"]`)
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }, label)
}
