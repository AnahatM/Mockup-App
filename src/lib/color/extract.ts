import { rgbToHex, type Rgb } from './hex'

/**
 * Extracts a small brand palette from an image using median cut over a colour
 * histogram.
 *
 * This is what powers "match my product's colours": the dominant colours of the
 * user's screenshot become one-click sources for rim lights, glows, backdrops
 * and device bodies.
 *
 * Two choices worth knowing about:
 *
 * - It runs over a **histogram of quantised colours**, not raw pixels. Splitting
 *   raw pixels at the positional median blends across clusters whenever their
 *   populations are uneven — a screenshot with one dominant accent and a small
 *   secondary would yield a muddy average of the two rather than either.
 * - Each bucket is represented by its **most common** colour, not its mean, for
 *   the same reason. The mean of a bucket spanning two clusters is a colour that
 *   appears nowhere in the image.
 *
 * Deterministic, so the same screenshot always yields the same palette and a
 * saved preset reproduces exactly. Pure: raw RGBA bytes in, hex strings out.
 */

export interface ExtractOptions {
  /** How many colours to return. */
  count?: number
  /** Skip near-white, near-black and near-grey, which dominate UI screenshots
   *  but say nothing about a product's identity. */
  ignoreExtremes?: boolean
  /** Sample every Nth pixel. Higher is faster and barely less accurate. */
  stride?: number
}

/** One quantised colour bin: the exact channel sums, and how many pixels landed. */
interface Bin {
  r: number
  g: number
  b: number
  count: number
}

/** 5 bits per channel: fine enough to keep brand colours distinct, coarse
 *  enough that gradients collapse into a handful of bins. */
const QUANT = 3

export function extractPalette(
  pixels: Uint8ClampedArray,
  { count = 6, ignoreExtremes = true, stride = 4 }: ExtractOptions = {},
): string[] {
  const bins = histogram(pixels, stride, ignoreExtremes)
  if (bins.length === 0) return []

  let buckets: Bin[][] = [bins]
  while (buckets.length < count) {
    const next = splitWidest(buckets)
    if (!next) break
    buckets = next
  }

  return buckets
    .filter((bucket) => bucket.length > 0)
    .map(represent)
    .sort((a, b) => b.weight - a.weight)
    .map((entry) => rgbToHex(entry.color))
}

function histogram(
  pixels: Uint8ClampedArray,
  stride: number,
  ignoreExtremes: boolean,
): Bin[] {
  const step = Math.max(1, Math.floor(stride)) * 4
  const bins = new Map<number, Bin>()

  for (let i = 0; i < pixels.length; i += step) {
    const r = pixels[i] ?? 0
    const g = pixels[i + 1] ?? 0
    const b = pixels[i + 2] ?? 0
    if ((pixels[i + 3] ?? 255) < 24) continue

    if (ignoreExtremes) {
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      if (max > 244 || max < 18 || max - min < 12) continue
    }

    const key = ((r >> QUANT) << 10) | ((g >> QUANT) << 5) | (b >> QUANT)
    const bin = bins.get(key)
    if (bin) {
      bin.r += r
      bin.g += g
      bin.b += b
      bin.count += 1
    } else {
      bins.set(key, { r, g, b, count: 1 })
    }
  }

  return [...bins.values()]
}

const CHANNELS = ['r', 'g', 'b'] as const
type Channel = (typeof CHANNELS)[number]

/** Mean channel value of a bin, recovered from its sums. */
const mean = (bin: Bin, channel: Channel): number => bin[channel] / bin.count

/**
 * Splits the bucket whose colours span the widest channel range, at the
 * pixel-count-weighted median along that channel.
 */
function splitWidest(buckets: Bin[][]): Bin[][] | null {
  let bestIndex = -1
  let bestRange = 0
  let bestChannel: Channel = 'r'

  buckets.forEach((bucket, index) => {
    if (bucket.length < 2) return
    for (const channel of CHANNELS) {
      const values = bucket.map((bin) => mean(bin, channel))
      const range = Math.max(...values) - Math.min(...values)
      if (range > bestRange) {
        bestRange = range
        bestIndex = index
        bestChannel = channel
      }
    }
  })

  const target = buckets[bestIndex]
  if (bestIndex < 0 || !target || bestRange === 0) return null

  const sorted = [...target].sort((a, b) => mean(a, bestChannel) - mean(b, bestChannel))
  const cut = weightedMedianIndex(sorted)

  return [
    ...buckets.slice(0, bestIndex),
    sorted.slice(0, cut),
    sorted.slice(cut),
    ...buckets.slice(bestIndex + 1),
  ]
}

/** Split point closest to half the pixels, always leaving both sides non-empty. */
function weightedMedianIndex(sorted: Bin[]): number {
  const total = sorted.reduce((sum, bin) => sum + bin.count, 0)
  let running = 0
  let bestCut = 1
  let bestDelta = Infinity

  for (let i = 0; i < sorted.length - 1; i += 1) {
    running += sorted[i]?.count ?? 0
    const delta = Math.abs(running - total / 2)
    if (delta < bestDelta) {
      bestDelta = delta
      bestCut = i + 1
    }
  }

  return bestCut
}

/** The bucket's most common colour, at its exact original value. */
function represent(bucket: Bin[]): { color: Rgb; weight: number } {
  let dominant = bucket[0] as Bin
  let weight = 0

  for (const bin of bucket) {
    weight += bin.count
    if (bin.count > dominant.count) dominant = bin
  }

  return {
    color: {
      r: mean(dominant, 'r'),
      g: mean(dominant, 'g'),
      b: mean(dominant, 'b'),
    },
    weight,
  }
}
