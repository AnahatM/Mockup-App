/**
 * Isolates whether canvas.captureStream() yields frames for a WebGL canvas,
 * and whether the headless mode is the reason it might not.
 *
 * Run as: node scripts/probe-capture.mjs [shell|new]
 */
import puppeteer from 'puppeteer-core'

const mode = process.argv[2] === 'new' ? true : 'shell'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: mode,
  args: [
    '--no-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
})
const page = await browser.newPage()
await page.setViewport({ width: 1000, height: 700 })
await page.goto('http://localhost:5173/studio', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))

const result = await page.evaluate(async () => {
  const record = async (
    canvas,
    label,
    mimeType = 'video/webm;codecs=vp8',
    bitrate,
    useRaf = false,
  ) => {
    const stream = canvas.captureStream(30)
    const track = stream.getVideoTracks()[0]
    const options = { mimeType }
    if (bitrate) options.videoBitsPerSecond = bitrate
    const recorder = new MediaRecorder(stream, options)
    let bytes = 0
    recorder.ondataavailable = (e) => {
      bytes += e.data.size
    }
    recorder.start(200)
    if (useRaf) {
      // Exactly the app's timing loop, to test whether rAF is the difference.
      const startedAt = performance.now()
      await new Promise((resolve) => {
        const tick = () => {
          if (performance.now() - startedAt >= 4000) return resolve()
          requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      })
    } else {
      await new Promise((r) => setTimeout(r, 4000))
    }
    recorder.requestData()
    await new Promise((r) => {
      recorder.onstop = r
      recorder.stop()
    })
    for (const t of stream.getTracks()) t.stop()
    return { label, bytes, trackState: track?.readyState ?? 'none' }
  }

  // Control: a 2D canvas that is definitely being painted.
  const twoD = document.createElement('canvas')
  twoD.width = 320
  twoD.height = 240
  twoD.style.cssText = 'position:fixed;left:-9999px'
  document.body.appendChild(twoD)
  const ctx = twoD.getContext('2d')
  let frame = 0
  const timer = setInterval(() => {
    ctx.fillStyle = `hsl(${(frame += 7) % 360} 70% 50%)`
    ctx.fillRect(0, 0, 320, 240)
  }, 33)

  const control = await record(twoD, '2d-control')
  clearInterval(timer)
  twoD.remove()

  const webgl = document.querySelector('canvas')
  const vp9Default = await record(webgl, 'vp9-default-bitrate', 'video/webm;codecs=vp9')
  const vp9Bitrate = await record(
    webgl,
    'vp9-12mbps',
    'video/webm;codecs=vp9',
    12_000_000,
  )
  const vp8Bitrate = await record(
    webgl,
    'vp8-12mbps',
    'video/webm;codecs=vp8',
    12_000_000,
  )

  const withRaf = await record(
    webgl,
    'vp9-raf-timing',
    'video/webm;codecs=vp9',
    12_000_000,
    true,
  )

  return { control, vp9Default, vp9Bitrate, vp8Bitrate, withRaf }
})

await browser.close()
console.log(JSON.stringify({ headless: mode, ...result }, null, 2))
