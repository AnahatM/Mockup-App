/**
 * Verifies undo/redo.
 *
 * Checks the things that actually break: that a slider drag coalesces into one
 * undo step rather than hundreds, that undo restores the previous value, that
 * redo returns to it, and that editing after an undo drops the redo branch.
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
await page.goto('http://localhost:5173/studio', {
  waitUntil: 'domcontentloaded',
  timeout: 60_000,
})
// `domcontentloaded`, not `networkidle0`: the dev server holds an HMR socket
// open, so the network is never idle and the wait always times out.
await page.waitForSelector('canvas', { timeout: 60_000 })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
await wait(4000)

/** Drives a range input the way React expects. */
const setRange = (label, value) =>
  page.evaluate(
    ({ label, value }) => {
      const el = [...document.querySelectorAll('input[type=range]')].find(
        (i) => i.getAttribute('aria-label') === label,
      )
      if (!el) return false
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set
      setter.call(el, String(value))
      el.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    },
    { label, value },
  )

const readRange = (label) =>
  page.evaluate(
    (label) =>
      [...document.querySelectorAll('input[type=range]')].find(
        (i) => i.getAttribute('aria-label') === label,
      )?.value ?? null,
    label,
  )

const undoState = () =>
  page.evaluate(() => {
    const undo = document.querySelector('button[aria-label="Undo"]')
    const redo = document.querySelector('button[aria-label="Redo"]')
    return { canUndo: undo ? !undo.disabled : null, canRedo: redo ? !redo.disabled : null }
  })

const click = (label) => page.click(`button[aria-label="${label}"]`)

// Find a slider to drive. Levitate lives on the Device tab, which is open.
const LABEL = 'Levitate'
const found = await setRange(LABEL, 0.4)
await wait(900)

const atStart = await undoState()
const afterFirst = await readRange(LABEL)

// Simulate a drag: many rapid updates that must collapse into ONE undo step.
for (const value of [0.5, 0.6, 0.7, 0.8, 0.9]) {
  await setRange(LABEL, value)
  await wait(40)
}
await wait(900)
const afterDrag = await readRange(LABEL)
const afterDragState = await undoState()

// One undo should return to the pre-drag value, not to 0.8.
await click('Undo')
await wait(500)
const afterUndo = await readRange(LABEL)

await click('Redo')
await wait(500)
const afterRedo = await readRange(LABEL)

// Undo, then edit: the redo branch must be dropped.
await click('Undo')
await wait(400)
await setRange(LABEL, 0.25)
await wait(900)
const afterBranch = await undoState()

await browser.close()
console.log(
  JSON.stringify(
    {
      sliderFound: found,
      atStart,
      afterFirst,
      afterDrag,
      afterDragState,
      afterUndo,
      afterRedo,
      dragCoalescedToOneStep: afterUndo === afterFirst,
      redoRestored: afterRedo === afterDrag,
      branchDropped: afterBranch.canRedo === false,
      problems,
    },
    null,
    2,
  ),
)
