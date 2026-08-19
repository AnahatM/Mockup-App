/** Generates a synthetic "app screenshot" PNG to test the media pipeline with. */
import { writeFileSync } from 'node:fs'
import zlib from 'node:zlib'

const W = 1179
const H = 2556
const px = Buffer.alloc(W * H * 3)

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3
    const t = y / H
    // Indigo -> teal vertical gradient
    let r = Math.round(58 + t * 20)
    let g = Math.round(70 + t * 120)
    let b = Math.round(150 + t * 60)
    // Card bands, so fit/crop behaviour is obvious at a glance
    const inCard =
      x > 90 && x < W - 90 && (y - 420) % 300 < 210 && y > 420 && y < H - 300
    if (inCard) {
      r = 245
      g = 244
      b = 240
    }
    // Top bar
    if (y < 220) {
      r = 24
      g = 28
      b = 48
    }
    // Bottom bar
    if (y > H - 200) {
      r = 24
      g = 28
      b = 48
    }
    px[i] = r
    px[i + 1] = g
    px[i + 2] = b
  }
}

const raw = Buffer.alloc(H * (W * 3 + 1))
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0
  px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3)
}

const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body) >>> 0)
  return Buffer.concat([len, body, crc])
}
const table = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()
function crc32(buf) {
  let c = -1
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8)
  return c ^ -1
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8
ihdr[9] = 2
ihdr[10] = 0
ihdr[11] = 0
ihdr[12] = 0

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
])

writeFileSync(process.argv[2] ?? 'scripts/out/fixture.png', png)
console.log(`wrote ${W}x${H}`)
