/**
 * Audits keyboard focus.
 *
 * Tabs through every interactive control on a page and checks each one shows a
 * visible focus indicator. A control that can be reached by keyboard but gives
 * no sign of it is reachable in theory only.
 */
import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const ROUTE = process.argv[2] ?? '/studio'
const MAX_STOPS = 120

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
await page.setViewport({ width: 1440, height: 900 })
await page.goto(`${BASE}${ROUTE}`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
await page.waitForSelector('body', { timeout: 60_000 })
await new Promise((r) => setTimeout(r, ROUTE === '/studio' ? 9000 : 2000))

/** Describes the focused element and whether anything visibly marks it. */
const inspectFocus = () =>
  page.evaluate(() => {
    const el = document.activeElement
    if (!el || el === document.body) return null

    const style = getComputedStyle(el)
    const before = getComputedStyle(el, '::before')
    // Some controls are zero-width wrappers whose indicator lives on a child.
    const child = el.firstElementChild
    const childShadowed = child ? getComputedStyle(child).boxShadow !== 'none' : false
    const outlined =
      style.outlineStyle !== 'none' && parseFloat(style.outlineWidth || '0') > 0
    // Some controls mark focus with a shadow or a pseudo-element instead.
    const shadowed = style.boxShadow !== 'none'
    const pseudo = before.content !== 'none' && before.outlineStyle !== 'none'

    return {
      tag: el.tagName.toLowerCase(),
      name:
        el.getAttribute('aria-label') ??
        el.textContent?.trim().slice(0, 30) ??
        el.getAttribute('type') ??
        '',
      visible: outlined || shadowed || pseudo || childShadowed,
    }
  })

const seen = new Set()
const stops = []
for (let i = 0; i < MAX_STOPS; i += 1) {
  await page.keyboard.press('Tab')
  const focus = await inspectFocus()
  if (!focus) continue
  const key = `${focus.tag}:${focus.name}`
  if (seen.has(key)) break
  seen.add(key)
  stops.push(focus)
}

await browser.close()
const invisible = stops.filter((s) => !s.visible)
console.log(
  JSON.stringify(
    {
      route: ROUTE,
      reachable: stops.length,
      withoutVisibleFocus: invisible.length,
      offenders: invisible.slice(0, 12),
    },
    null,
    2,
  ),
)
