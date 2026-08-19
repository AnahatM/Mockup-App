/**
 * Renders every device in the catalogue and reports anything wrong.
 *
 * With fifteen devices, eyeballing them one at a time misses things. This checks
 * each one for console errors and for a render that is suspiciously empty (a
 * device positioned off-camera or failing to build geometry shows up as a frame
 * with almost no variation in it).
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

mkdirSync('scripts/out/devices', { recursive: true })

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
await page.setViewport({ width: 1100, height: 850 })

const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && problems.push(`[error] ${m.text()}`))

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))

const names = await page.evaluate(() =>
  [...document.querySelectorAll('nav[aria-label="Device library"] button')].map(
    (b) => b.textContent?.trim() ?? '',
  ),
)

const results = []
for (const name of names) {
  const before = problems.length

  await page.evaluate((target) => {
    const button = [
      ...document.querySelectorAll('nav[aria-label="Device library"] button'),
    ].find((b) => b.textContent?.trim() === target)
    button?.click()
  }, name)
  await new Promise((r) => setTimeout(r, 1800))

  // Measure how much the render varies. A blank or off-camera device leaves an
  // almost uniform frame; a real one has edges, shadow and reflection.
  const variance = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = 120
    off.height = 120
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0, 120, 120)
    const { data } = ctx.getImageData(0, 0, 120, 120)
    const values = []
    for (let i = 0; i < data.length; i += 4) values.push(data[i])
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const sq = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length
    return Math.round(Math.sqrt(sq))
  })

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  await page.screenshot({ path: `scripts/out/devices/${slug}.png` })

  results.push({
    name,
    stdDev: variance,
    looksEmpty: variance < 6,
    newProblems: problems.slice(before),
  })
}

await browser.close()

const suspect = results.filter((r) => r.looksEmpty || r.newProblems.length > 0)
console.log(
  JSON.stringify(
    {
      devices: results.length,
      allRendered: suspect.length === 0,
      suspect,
      summary: results.map((r) => `${r.name}: ${r.stdDev}`),
    },
    null,
    2,
  ),
)
