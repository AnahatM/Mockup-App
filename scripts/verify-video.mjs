/**
 * Verifies the video path end to end.
 *
 * Generates a real WebM in-page with MediaRecorder, feeds it through the actual
 * dropzone via a DataTransfer, and confirms it decodes and plays on the device.
 * Doubles as a pre-check that MediaRecorder works here at all, which P7's
 * recording feature depends on.
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

const recorded = await page.evaluate(async () => {
  const canvas = document.createElement('canvas')
  canvas.width = 540
  canvas.height = 1170
  // captureStream only produces frames for a canvas that is actually composited,
  // so it has to be in the document even though we do not want to see it.
  canvas.style.cssText = 'position:fixed;left:-9999px;top:0'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const stream = canvas.captureStream(30)
  const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm'
  const recorder = new MediaRecorder(stream, { mimeType: mime })
  const chunks = []
  recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)

  let frame = 0
  const draw = () => {
    ctx.fillStyle = `hsl(${(frame * 6) % 360} 60% 45%)`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#f4f3ee'
    ctx.fillRect(60, 200 + (frame % 40) * 8, canvas.width - 120, 180)
    frame += 1
  }
  // Drive with rAF so frames are produced in step with compositing.
  let running = true
  const tick = () => {
    if (!running) return
    draw()
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  recorder.start(150)
  // Headless compositing is uneven, so wait until real bytes have arrived
  // rather than for a fixed wall-clock duration.
  const deadline = performance.now() + 12000
  while (
    chunks.reduce((n, c) => n + c.size, 0) < 8000 &&
    performance.now() < deadline
  ) {
    await new Promise((r) => setTimeout(r, 200))
  }
  await new Promise((r) => {
    recorder.onstop = r
    recorder.stop()
  })
  running = false
  canvas.remove()

  const blob = new Blob(chunks, { type: 'video/webm' })
  const file = new File([blob], 'demo.webm', { type: 'video/webm' })
  const dt = new DataTransfer()
  dt.items.add(file)
  const input = document.querySelector('input[type=file]')
  input.files = dt.files
  input.dispatchEvent(new Event('change', { bubbles: true }))
  return { mime, bytes: blob.size }
})

await new Promise((r) => setTimeout(r, 3500))

/**
 * The <video> feeding a VideoTexture is deliberately detached from the DOM (the
 * standard three.js pattern), so playback is confirmed by sampling the rendered
 * frame instead: if the texture is updating, the pixels change.
 */
const sample = () =>
  page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const off = document.createElement('canvas')
    off.width = 64
    off.height = 64
    const ctx = off.getContext('2d')
    ctx.drawImage(canvas, 0, 0, 64, 64)
    const { data } = ctx.getImageData(0, 0, 64, 64)
    let sum = 0
    for (let i = 0; i < data.length; i += 4) sum += data[i] + data[i + 1] + data[i + 2]
    return Math.round(sum / (data.length / 4))
  })

const first = await sample()
await new Promise((r) => setTimeout(r, 1200))
const second = await sample()

const state = await page.evaluate(() => {
  const label = document.querySelector('aside[aria-label="Inspector"] p[title]')
  return {
    loadedName: label?.getAttribute('title') ?? null,
    error: document.querySelector('[role=alert]')?.textContent ?? null,
  }
})
state.frameA = first
state.frameB = second
state.framesChanged = first !== second

await page.screenshot({ path: 'scripts/out/media-video.png' })
await browser.close()
console.log(JSON.stringify({ recorded, state, problems }, null, 2))
