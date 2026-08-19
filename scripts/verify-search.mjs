/**
 * Verifies the command palette: opens it, types a query, checks the results
 * group correctly, and confirms that choosing a setting switches to the right
 * inspector tab and flags the control.
 */
import puppeteer from 'puppeteer-core'

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
await page.setViewport({ width: 1400, height: 900 })
const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && problems.push(`[error] ${m.text()}`))

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Open with the keyboard, from a cold start.
await page.keyboard.press('/')
await wait(500)
const openedByKey = (await page.$('[role="dialog"][aria-label="Search"]')) !== null

const read = () =>
  page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"][aria-label="Search"]')
    if (!dialog) return null
    const groups = [...dialog.querySelectorAll('[role="listbox"] > div')].map((g) => ({
      group: g.querySelector('p')?.textContent,
      count: g.querySelectorAll('[role="option"]').length,
    }))
    const active = dialog.querySelector('[data-active="true"]')
    return { groups, active: active?.textContent ?? null }
  })

const emptyQuery = await read()

// A query that should hit several groups at once.
await page.type('input[aria-label="Search"]', 'exposure')
await wait(400)
const exposure = await read()

// Arrow down then Enter should activate the second result.
await page.keyboard.press('ArrowDown')
await wait(200)
const afterArrow = await read()

// Now pick the first exposure setting and confirm we land on it.
await page.keyboard.press('ArrowUp')
await wait(150)
await page.keyboard.press('Enter')
await wait(700)

const landing = await page.evaluate(() => {
  const dialogGone = !document.querySelector('[role="dialog"][aria-label="Search"]')
  const tab = document.querySelector('[role="tab"][aria-selected="true"]')?.textContent
  const flagged = [...document.querySelectorAll('aside[aria-label="Inspector"] div')]
    .filter((el) => getComputedStyle(el).outlineStyle === 'solid')
    .map((el) => el.textContent?.slice(0, 40))
  return { dialogGone, tab, flagged }
})

// A doc result should navigate.
await page.keyboard.down('Control')
await page.keyboard.press('k')
await page.keyboard.up('Control')
await wait(400)
const openedByChord = (await page.$('[role="dialog"][aria-label="Search"]')) !== null

await browser.close()
console.log(
  JSON.stringify(
    { openedByKey, openedByChord, emptyQuery, exposure, afterArrow, landing, problems },
    null,
    2,
  ),
)
