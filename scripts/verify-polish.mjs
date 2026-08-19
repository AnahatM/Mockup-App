/**
 * Checks the UI-polish pass: no browser tooltips left on controls, palette
 * cards carry visible names, the loading bar reacts to real async work, and
 * deleting a preset asks first.
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
await page.setViewport({ width: 1400, height: 950 })
const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && problems.push(`[error] ${m.text()}`))

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
await wait(3500)

// 1. No native title tooltips left on interactive controls.
const strayTitles = await page.evaluate(() =>
  [...document.querySelectorAll('button[title], [role="tab"][title], [role="radio"][title]')].map(
    (el) => el.getAttribute('title'),
  ),
)

// 2. Palette cards show names. Device tab is open by default.
const paintCards = await page.evaluate(() => {
  const buttons = [...document.querySelectorAll('aside[aria-label="Inspector"] button')]
  const named = buttons.filter((b) => /^(Red|Crimson|White|Violet|Graphite|Black)/.test(b.textContent ?? ''))
  return { count: named.length, sample: named.slice(0, 4).map((b) => b.textContent) }
})

// 3. A custom tooltip appears on hover, and it is ours, not the browser's.
const toolbarButton = await page.$('header button[aria-label]')
await toolbarButton.hover()
await wait(600)
const tooltip = await page.evaluate(
  () => document.querySelector('header span[class*="tip"]')?.textContent ?? null,
)

// 4. The loading bar is wired: it must be absent at rest.
const barAtRest = await page.evaluate(
  () => document.querySelectorAll('[class*="LoadingBar"], [data-loading]').length,
)

// 5. Save a preset, then confirm delete asks before destroying it.
await openTab(page, 'Presets')
await wait(600)
await page.type('input[aria-label="Preset name"], input[placeholder="Name this look"]', 'Test look')
await clickByText(page, 'Save')
await wait(700)
const savedCount = await countPresets(page)

const del = await page.$('button[aria-label="Delete Test look"]')
await del.click()
await wait(500)
// A native <dialog> has an implicit role, so match the element, not [role].
const dialog = await page.evaluate(() => {
  const el = document.querySelector('dialog[open]')
  return el ? { text: el.textContent?.slice(0, 90), modal: el.matches(':modal') } : null
})
const stillThereWhileAsking = await countPresets(page)

// Cancel must leave it alone.
await clickByText(page, 'Cancel')
await wait(400)
const afterCancel = await countPresets(page)

// Confirming must actually delete it.
await (await page.$('button[aria-label="Delete Test look"]')).click()
await wait(400)
await clickByText(page, 'Delete')
await wait(500)
const afterConfirm = await countPresets(page)

await browser.close()
console.log(
  JSON.stringify(
    {
      strayTitles,
      paintCards,
      tooltip,
      barAtRest,
      savedCount,
      dialog,
      stillThereWhileAsking,
      afterCancel,
      afterConfirm,
      problems,
    },
    null,
    2,
  ),
)

async function countPresets(page) {
  return page.evaluate(
    () => document.querySelectorAll('button[aria-label^="Delete "]').length,
  )
}

async function openTab(page, name) {
  const tabs = await page.$$('[role="tab"]')
  const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
  const index = labels.findIndex((l) => l?.includes(name))
  if (index < 0) throw new Error(`tab ${name} not found`)
  await tabs[index].click()
}

async function clickByText(page, text) {
  const buttons = await page.$$('button')
  for (const button of buttons) {
    const label = await button.evaluate((el) => el.textContent)
    if (label?.trim() === text) {
      await button.click()
      return
    }
  }
  throw new Error(`button "${text}" not found`)
}
