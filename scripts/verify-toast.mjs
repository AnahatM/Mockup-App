/**
 * Verifies the success confirmations.
 *
 * An export writes a file to the downloads folder with no visible change in the
 * app, so "did that work?" was previously unanswerable. This checks the toast
 * appears, says the filename, and clears itself.
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync, rmSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const DIR = resolve('scripts/out/downloads')
if (existsSync(DIR)) rmSync(DIR, { recursive: true })
mkdirSync(DIR, { recursive: true })

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

const client = await page.createCDPSession()
await client.send('Browser.setDownloadBehavior', {
  behavior: 'allow',
  downloadPath: DIR,
  eventsEnabled: true,
})

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/studio', { waitUntil: 'domcontentloaded' })
await page.waitForSelector('canvas', { timeout: 60_000 })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
await wait(4000)

// Scoped to the toast host: the scene loading overlay is also role="status",
// and matching it made the probe report a toast that was never there.
const readToasts = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('[class*="host"] [role="status"]')]
      .map((el) => el.textContent?.trim())
      .filter(Boolean),
  )

// The scene overlay must clear before an export can succeed.
await page
  .waitForFunction(
    () => !document.body.textContent?.includes('Preparing studio'),
    { timeout: 120_000 },
  )
  .catch(() => problems.push('scene overlay never cleared'))

const before = await readToasts()

// Drive an export from the toolbar's Export button, which opens the panel.
await page.click('button[aria-label="Presets"]').catch(() => {})
const tabs = await page.$$('[role="tab"]')
const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
const index = labels.findIndex((l) => l?.includes('Export'))
if (index >= 0) await tabs[index].click()
await wait(800)

const buttons = await page.$$('button')
for (const button of buttons) {
  const text = await button.evaluate((el) => el.textContent)
  if (text?.includes('Export PNG')) {
    await button.click()
    break
  }
}

await wait(6000)
const during = await readToasts()

// It must clear itself without being dismissed.
await wait(5000)
const after = await readToasts()

await browser.close()
console.log(
  JSON.stringify(
    {
      before,
      during,
      after,
      appeared: during.length > 0,
      namesTheFile: during.some((t) => t?.includes('.png')),
      selfDismissed: after.length === 0,
      problems,
    },
    null,
    2,
  ),
)
