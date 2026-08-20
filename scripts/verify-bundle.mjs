/**
 * Which JavaScript each route actually downloads.
 *
 * Separate chunks in the build output prove nothing on their own — a chunk that
 * is statically imported by the entry is still fetched immediately. This asks
 * the browser instead: navigate, and record every script it requests.
 *
 * The property being defended (ADR 0006): the site pages must not download the
 * 3D engine, and the 2D window tool must be cheap to open.
 */
import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const ROUTES = ['/', '/docs', '/window', '/studio']

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

const results = []
for (const route of ROUTES) {
  const page = await browser.newPage()
  await page.setCacheEnabled(false)
  const scripts = new Map()

  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
  // Give lazy chunks a chance to arrive, so we do not under-report.
  await new Promise((r) => setTimeout(r, route === '/studio' ? 9000 : 4000))

  /*
   * Sizes come from the Performance API rather than Content-Length, which the
   * preview server omits for compressed responses — every file read as 0kB.
   *
   * And the check is on *bytes*, not on chunk names. An earlier version of this
   * script flagged "downloaded a file called r3f", which was wrong twice over:
   * that chunk turned out to hold mostly React, and once the chunking config
   * changed there was no such filename at all, so it reported success while the
   * studio was still loading three.js. Size is the thing that actually matters
   * to a visitor, and it cannot be gamed by renaming a chunk.
   */
  const measured = await page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((entry) => entry.name.endsWith('.js'))
      .map((entry) => ({
        name: entry.name.split('/').pop(),
        bytes: entry.encodedBodySize || entry.transferSize || 0,
      })),
  )

  for (const { name, bytes } of measured) scripts.set(name, bytes)
  const files = [...scripts.entries()].sort((a, b) => b[1] - a[1])
  const total = files.reduce((sum, [, bytes]) => sum + bytes, 0)

  results.push({
    route,
    totalKB: Math.round(total / 1024),
    files: files.map(([name, bytes]) => `${name} ${Math.round(bytes / 1024)}kB`),
  })
  await page.close()
}

await browser.close()
console.log(JSON.stringify(results, null, 2))
