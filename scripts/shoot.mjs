/**
 * Dev-only visual check.
 *
 * Loads the running dev server in headless Chrome, captures a screenshot and
 * reports any console errors or page exceptions. Used to verify each phase
 * actually renders rather than merely compiling.
 *
 * Usage: node scripts/shoot.mjs [outfile.png] [theme] [waitMs]
 */
import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = process.env.APP_URL ?? 'http://localhost:5173/studio'
const [, , out = 'shot.png', theme = 'dark', waitMs = '3500'] = process.argv

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
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') {
    problems.push(`[${m.type()}] ${m.text()}`)
  }
})
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('requestfailed', (r) =>
  problems.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText ?? ''}`),
)

await page.evaluateOnNewDocument((t) => {
  localStorage.setItem('mockup-studio:theme', t)
}, theme)

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60_000 })
await new Promise((r) => setTimeout(r, Number(waitMs)))

const canvas = await page.evaluate(() => {
  const el = document.querySelector('canvas')
  if (!el) return { present: false }
  const gl = el.getContext('webgl2') ?? el.getContext('webgl')
  return { present: true, width: el.width, height: el.height, hasContext: Boolean(gl) }
})

await page.screenshot({ path: out })
await browser.close()

console.log(JSON.stringify({ canvas, problems }, null, 2))
