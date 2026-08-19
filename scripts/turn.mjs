/** Rotates the device via the Turn control and screenshots, so geometry can be
 *  inspected from any angle without hand-editing defaults. */
import puppeteer from 'puppeteer-core'

const [, , out = 'turn.png', degrees = '150', device = ''] = process.argv

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
page.on('pageerror', (e) => problems.push(e.message))
page.on('console', (m) => m.type() === 'error' && problems.push(m.text()))
await page.evaluateOnNewDocument(() =>
  localStorage.setItem('mockup-studio:theme', 'dark'),
)
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3000))

if (device) {
  const items = await page.$$('nav[aria-label="Device library"] button')
  for (const item of items) {
    const text = await item.evaluate((el) => el.textContent)
    if (text?.toLowerCase().includes(device.toLowerCase())) {
      await item.click()
      break
    }
  }
  await new Promise((r) => setTimeout(r, 1200))
}

// The Turn control is an angle control: shown in degrees, stored in radians.
await page.evaluate((deg) => {
  const el = [...document.querySelectorAll('input[type=range]')].find(
    (i) => i.getAttribute('aria-label') === 'Turn',
  )
  if (!el) throw new Error('Turn control not found')
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  ).set
  setter.call(el, String(deg))
  el.dispatchEvent(new Event('input', { bubbles: true }))
}, degrees)
await new Promise((r) => setTimeout(r, 1800))

await page.screenshot({ path: out })
await browser.close()
console.log(JSON.stringify({ problems }))
