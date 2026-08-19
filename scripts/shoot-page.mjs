/** Screenshots a site route. */
import puppeteer from 'puppeteer-core'

const [, , path = '/', out = 'scripts/out/page.png', theme = 'light', full = 'no'] =
  process.argv

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'shell',
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && problems.push(`[error] ${m.text()}`))

await page.evaluateOnNewDocument((t) => localStorage.setItem('mockup-studio:theme', t), theme)
await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1500))
await page.screenshot({ path: out, fullPage: full === 'full' })
await browser.close()
console.log(JSON.stringify({ path, problems }))
