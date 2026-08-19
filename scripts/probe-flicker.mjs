/**
 * Hunts for flicker.
 *
 * Samples the rendered canvas repeatedly and reports how much pixels change
 * between consecutive frames. A genuinely static scene should be near-identical
 * frame to frame; anything else is instability. Runs three ways so the cause can
 * be told apart:
 *
 *   static      — nothing moving at all
 *   turning     — device slowly rotating (surfaces the depth-precision case)
 *   levitating  — device lifted (surfaces anything tied to the ground plane)
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
await page.setViewport({ width: 900, height: 700 })
await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'light'),
)
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 4000))

/** Returns a downsampled grey frame. */
const grab = () =>
  page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = 96
    off.height = 96
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0, 96, 96)
    const { data } = ctx.getImageData(0, 0, 96, 96)
    const out = []
    for (let i = 0; i < data.length; i += 4) {
      out.push(Math.round(data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11))
    }
    return out
  })

async function measure(label, frames = 8, gap = 220) {
  const shots = []
  for (let i = 0; i < frames; i += 1) {
    shots.push(await grab())
    await new Promise((r) => setTimeout(r, gap))
  }

  let worstPixel = 0
  let changedPixels = 0
  let totalDelta = 0

  for (let i = 1; i < shots.length; i += 1) {
    const a = shots[i - 1]
    const b = shots[i]
    for (let p = 0; p < a.length; p += 1) {
      const delta = Math.abs(a[p] - b[p])
      if (delta > worstPixel) worstPixel = delta
      if (delta > 8) changedPixels += 1
      totalDelta += delta
    }
  }

  const comparisons = (shots.length - 1) * shots[0].length
  return {
    label,
    worstPixelDelta: worstPixel,
    meanDelta: Number((totalDelta / comparisons).toFixed(3)),
    unstablePixelsPerFrame: Math.round(changedPixels / (shots.length - 1)),
  }
}

async function setRange(label, value) {
  await page.evaluate(
    ({ label, value }) => {
      const el = [...document.querySelectorAll('input[type=range]')].find(
        (i) => i.getAttribute('aria-label') === label,
      )
      if (!el) return
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set
      setter.call(el, String(value))
      el.dispatchEvent(new Event('input', { bubbles: true }))
    },
    { label, value },
  )
  await new Promise((r) => setTimeout(r, 900))
}

const results = [await measure('static')]

// Device tab is open by default; Turn and Levitate live there.
await setRange('Turn', 35)
results.push(await measure('turned-35'))

await setRange('Levitate', 0.6)
results.push(await measure('levitating'))

// Now with an animation running, which is when instability is most visible.
const tabs = await page.$$('[role="tab"]')
const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
await tabs[labels.findIndex((l) => l?.includes('Animate'))].click()
await new Promise((r) => setTimeout(r, 500))
await page.select('select[aria-label="Motion"]', 'turntable')
await new Promise((r) => setTimeout(r, 1200))
results.push(await measure('animating'))

await browser.close()
console.log(JSON.stringify(results, null, 2))
