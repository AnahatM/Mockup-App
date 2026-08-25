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
/*
 * Per-route budgets, in transferred (compressed) kilobytes.
 *
 * These are ceilings with room to grow, not targets — the point is to fail when
 * something *structural* changes, like a 3D dependency arriving on a 2D page,
 * not to litigate every kilobyte.
 *
 * The one that carries the argument of ADR 0006 is `/window`. Measured
 * 2026-08-25 at 228 kB, of which 217 kB is the site shell every route loads and
 * 11 kB is the 2D compositor itself. If three.js comes back it lands at ~325 kB,
 * so a 260 kB ceiling catches that with headroom for the 2D tool to grow.
 *
 * Reporting these numbers rather than asserting them is how the regression this
 * check exists to catch survived: `/window` was 325 kB, and its chunk was 96%
 * three.js, reached through the media barrel. The number was even written into
 * ADR 0006's outcome table. Nobody read it as a failure, because nothing failed.
 */
const ROUTES = [
  { path: '/', budgetKB: 260 },
  { path: '/docs', budgetKB: 260 },
  { path: '/window', budgetKB: 260 },
  { path: '/studio', budgetKB: 720 },
]

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
for (const { path: route, budgetKB } of ROUTES) {
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

  const totalKB = Math.round(total / 1024)
  results.push({
    route,
    totalKB,
    budgetKB,
    over: totalKB > budgetKB,
    files: files.map(([name, bytes]) => `${name} ${Math.round(bytes / 1024)}kB`),
  })
  await page.close()
}

await browser.close()
console.log(JSON.stringify(results, null, 2))

const breaches = results.filter((r) => r.over)
for (const { route, totalKB, budgetKB } of breaches) {
  console.error(`FAIL ${route}: ${totalKB} kB transferred, budget ${budgetKB} kB.`)
}
if (breaches.length) {
  console.error(
    [
      'A route grew past its budget. If a 2D or site route jumped by hundreds of kB,',
      'the likely cause is a barrel re-export dragging three.js across a boundary -',
      'run scripts/verify-eager-graph.mjs, and check what each chunk actually holds.',
    ].join(' '),
  )
  process.exit(1)
}
console.log('All routes within budget.')
