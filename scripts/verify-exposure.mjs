/** Measures mean canvas luminance at two exposure settings to prove the
 *  tone-mapping exposure control actually reaches the renderer. */
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
await page.setViewport({ width: 1200, height: 800 })
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3000))

const luminance = () =>
  page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = 160
    off.height = 120
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0, 160, 120)
    const { data } = ctx.getImageData(0, 0, 160, 120)
    let sum = 0
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]
    }
    return sum / (data.length / 4)
  })

const setExposure = (value) =>
  page.evaluate((v) => {
    const el = [...document.querySelectorAll('input[type=range]')].find(
      (i) => i.getAttribute('aria-label') === 'Exposure',
    )
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    ).set
    setter.call(el, String(v))
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)

const tabs = await page.$$('[role="tab"]')
const labels = await Promise.all(tabs.map((t) => t.evaluate((el) => el.textContent)))
await tabs[labels.findIndex((l) => l?.includes('Scene'))].click()
await new Promise((r) => setTimeout(r, 400))

await setExposure(0.4)
await new Promise((r) => setTimeout(r, 1200))
const dim = await luminance()

await setExposure(2.6)
await new Promise((r) => setTimeout(r, 1200))
const bright = await luminance()

await browser.close()
console.log(
  JSON.stringify({
    atExposure0_4: dim.toFixed(2),
    atExposure2_6: bright.toFixed(2),
    ratio: (bright / dim).toFixed(2),
  }),
)
