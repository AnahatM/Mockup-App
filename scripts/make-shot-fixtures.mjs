/**
 * Captures Mockup Studio's own pages, to be used as the screenshots inside its
 * own marketing mockups.
 *
 * The promotional shots need something on the device screen, and the synthetic
 * gradients in `make-fixture.mjs` are the wrong tool: they exist so a
 * regression script can tell one upload from another, and they look like
 * exactly what they are. A landing page rendered on a phone has to look like a
 * landing page or the mockup is not selling anything.
 *
 * Photographing this app rather than someone else's is the only honest option
 * on a public repo. Any real product's UI is their design and their trademark,
 * and a mockup tool shipping a competitor's homepage in its own hero image is
 * a problem no licence fixes. This one is ours, it stays current as the app
 * changes, and regenerating it is one command.
 *
 * Run against a static build: `npm run build && npx vite preview --port 4173`.
 */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const PORT = process.env.PORT ?? '4173'

/**
 * What to shoot, at what size, and where it lands.
 *
 * The viewports are the real device resolutions the mockups will letterbox
 * into, so nothing is rescaled twice: a phone-shaped capture on a phone, a
 * desktop-shaped one on a laptop.
 */
const SHOTS = [
  {
    name: 'screenshot.png',
    path: '/',
    width: 430,
    height: 932,
    scale: 3,
    settle: 2600,
  },
  {
    name: 'screenshot-desktop.png',
    path: '/',
    width: 1512,
    height: 982,
    scale: 2,
    settle: 2600,
  },
  {
    name: 'screenshot-docs.png',
    path: '/docs',
    width: 1512,
    height: 982,
    scale: 2,
    settle: 1800,
  },
]

mkdirSync('scripts/out', { recursive: true })

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

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const problems = []
const written = []

for (const shot of SHOTS) {
  const page = await browser.newPage()
  page.on('pageerror', (e) => problems.push(`${shot.path}: ${e.message}`))

  await page.setViewport({
    width: shot.width,
    height: shot.height,
    deviceScaleFactor: shot.scale,
  })
  await page.goto(`http://localhost:${PORT}${shot.path}`, {
    waitUntil: 'load',
    timeout: 60_000,
  })

  // The landing page reveals sections on scroll, so anything below the fold is
  // still transparent when the page finishes loading. Scrolling to the bottom
  // and back fires every observer before the shutter opens.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await wait(900)
  await page.evaluate(() => window.scrollTo(0, 0))
  await wait(shot.settle)

  await page.screenshot({ path: `scripts/out/${shot.name}`, type: 'png' })
  written.push(shot.name)
  await page.close()
}

await browser.close()
console.log(JSON.stringify({ written, problems }, null, 2))
process.exit(problems.length > 0 ? 1 : 0)
