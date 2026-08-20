/**
 * Reproduces the reported desktop-device glitch.
 *
 * "Glitches out / does not appear properly when moving the camera" is the
 * classic signature of frustum culling against a wrong bounding volume: the
 * mesh vanishes at certain camera angles even though it is plainly in shot.
 *
 * Measures how much of the frame the device occupies at a series of camera
 * angles. A device that is culled shows a sudden collapse to near-zero.
 */
import puppeteer from 'puppeteer-core'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const DEVICES = process.argv.slice(2)
const TARGETS = DEVICES.length ? DEVICES : ['Monitor 27', 'All-in-one 24', 'Pro Phone']

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
await page.setViewport({ width: 1000, height: 760 })
const problems = []
page.on('pageerror', (e) => problems.push(e.message.slice(0, 140)))

await page.goto(`${BASE}/studio`, { waitUntil: 'domcontentloaded', timeout: 60_000 })
await page.waitForSelector('canvas', { timeout: 60_000 })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
await wait(9000)

/**
 * Luminance spread across the middle of the frame.
 *
 * The backdrop is a smooth gradient, so a frame containing only backdrop is
 * nearly uniform. A device — any device — introduces edges and shading, so its
 * presence shows up as spread. When it is culled, the number collapses.
 */
const coverage = () =>
  page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = 160
    off.height = 120
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0, 160, 120)
    // Centre 60% only: the panels and edges of frame are not the subject.
    const { data } = ctx.getImageData(32, 24, 96, 72)
    const grey = []
    for (let i = 0; i < data.length; i += 4) {
      grey.push(0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2])
    }
    const mean = grey.reduce((a, b) => a + b, 0) / grey.length
    const variance = grey.reduce((a, g) => a + (g - mean) ** 2, 0) / grey.length
    return Number(Math.sqrt(variance).toFixed(2))
  })

async function selectDevice(name) {
  const items = await page.$$('aside[aria-label="Devices"] button')
  for (const item of items) {
    const text = await item.evaluate((el) => el.textContent)
    if (text?.includes(name)) {
      await item.click()
      return true
    }
  }
  return false
}

/** Drags across the viewport to orbit, in steps. */
async function orbit(steps) {
  const box = await (await page.$('canvas')).boundingBox()
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  const samples = []

  await page.mouse.move(cx, cy)
  await page.mouse.down()
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.move(cx + (i + 1) * 26, cy - (i % 3) * 9, { steps: 3 })
    await wait(320)
    samples.push(await coverage())
  }
  await page.mouse.up()
  await wait(300)
  return samples
}

const results = []
for (const name of TARGETS) {
  const found = await selectDevice(name)
  if (!found) {
    results.push({ device: name, error: 'not in the device rail' })
    continue
  }
  await wait(2600)

  const before = await coverage()
  const during = await orbit(8)
  const all = [before, ...during]
  const min = Math.min(...all)
  const max = Math.max(...all)

  results.push({
    device: name,
    coverage: all,
    min,
    max,
    // A device that is culled mid-orbit leaves a near-flat backdrop behind.
    vanishes: max > 6 && min < max * 0.25,
  })
}

await browser.close()
console.log(JSON.stringify({ results, problems }, null, 2))
