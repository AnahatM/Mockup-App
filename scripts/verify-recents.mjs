/**
 * End-to-end check of the recent-uploads feature: upload two different
 * screenshots through the real dropzone, confirm both show up as recent
 * thumbnails, click the older one, and confirm the device screen actually
 * switches back to it (not just that the label changed) by sampling the
 * rendered WebGL canvas.
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
await page.setViewport({ width: 1400, height: 1000 })
const problems = []
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && problems.push(`[error] ${m.text()}`))

await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3000))

const tabs = await page.$$('[role="tab"]')
const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
await tabs[labels.findIndex((l) => l?.includes('Screen'))].click()
await new Promise((r) => setTimeout(r, 400))

const input = await page.$('input[type=file]')
if (!input) throw new Error('file input not rendered')

const loadedName = () =>
  page.evaluate(
    () =>
      document.querySelector('aside[aria-label="Inspector"] span[class*="titleText"]')
        ?.textContent ?? null,
  )
const recentButtons = () =>
  page.evaluate(() =>
    [...document.querySelectorAll('button[aria-label^="Switch to "]')].map((b) => ({
      label: b.getAttribute('aria-label'),
      active: b.getAttribute('aria-pressed') === 'true',
    })),
  )
// Whole-canvas averages are dominated by the grey studio backdrop and
// pedestal, which never change — so this crops to a box centered on the
// device screen itself (found by eyeballing scripts/out/recents-1.png).
const sampleScreen = () =>
  page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return null
    const cropX = Math.round(canvas.width * 0.42)
    const cropY = Math.round(canvas.height * 0.22)
    const cropW = Math.round(canvas.width * 0.16)
    const cropH = Math.round(canvas.height * 0.5)
    const off = document.createElement('canvas')
    off.width = cropW
    off.height = cropH
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH)
    const { data } = ctx.getImageData(0, 0, cropW, cropH)
    let r = 0
    let g = 0
    let b = 0
    const n = data.length / 4
    for (let i = 0; i < data.length; i += 4) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
    }
    return [r / n, g / n, b / n]
  })

// Upload the first (indigo/teal) screenshot.
await input.uploadFile('scripts/out/screenshot.png')
await new Promise((r) => setTimeout(r, 2500))
const nameAfterFirst = await loadedName()
const sampleAfterFirst = await sampleScreen()
await page.screenshot({ path: 'scripts/out/recents-1.png' })

// Upload the second (orange/magenta) screenshot — replaces the current media.
await input.uploadFile('scripts/out/screenshot2.png')
await new Promise((r) => setTimeout(r, 2500))
const nameAfterSecond = await loadedName()
const sampleAfterSecond = await sampleScreen()
await page.screenshot({ path: 'scripts/out/recents-2.png' })

const buttonsAfterTwo = await recentButtons()

// Click the older recent thumbnail (screenshot.png) to switch back to it.
const clicked = await page.evaluate(() => {
  const target = [...document.querySelectorAll('button[aria-label^="Switch to "]')].find(
    (b) => b.getAttribute('aria-label') === 'Switch to screenshot.png',
  )
  if (!target) return false
  target.click()
  return true
})
await new Promise((r) => setTimeout(r, 1500))
const nameAfterSwitch = await loadedName()
const sampleAfterSwitch = await sampleScreen()
const buttonsAfterSwitch = await recentButtons()
await page.screenshot({ path: 'scripts/out/recents-3.png' })

await browser.close()

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

const result = {
  nameAfterFirst,
  nameAfterSecond,
  nameAfterSwitch,
  clicked,
  twoRecentThumbnails: buttonsAfterTwo.length === 2,
  buttonsAfterTwo,
  buttonsAfterSwitch,
  screenChangedBetweenUploads: dist(sampleAfterFirst, sampleAfterSecond) > 15,
  screenSwitchedBackToFirst: dist(sampleAfterFirst, sampleAfterSwitch) < 5,
  samples: {
    afterFirst: sampleAfterFirst,
    afterSecond: sampleAfterSecond,
    afterSwitch: sampleAfterSwitch,
  },
  problems,
}
console.log(JSON.stringify(result, null, 2))
