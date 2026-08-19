import { describe, expect, it } from 'vitest'
import { extractPalette } from './extract'
import { hexToRgb } from './hex'

/** Builds RGBA bytes from a list of [color, repeatCount] pairs. */
function pixels(entries: Array<[hex: string, times: number]>): Uint8ClampedArray {
  const out: number[] = []
  for (const [hex, times] of entries) {
    const { r, g, b } = hexToRgb(hex)
    for (let i = 0; i < times; i += 1) out.push(r, g, b, 255)
  }
  return new Uint8ClampedArray(out)
}

// stride 1 so every synthetic pixel counts.
const extract = (data: Uint8ClampedArray, count = 4) =>
  extractPalette(data, { count, stride: 1 })

describe('extractPalette', () => {
  it('finds the dominant colours of a simple image', () => {
    const result = extract(
      pixels([
        ['#cc3344', 400],
        ['#3355cc', 200],
      ]),
      2,
    )
    expect(result).toHaveLength(2)
    expect(result).toContain('#cc3344')
    expect(result).toContain('#3355cc')
  })

  it('orders colours by how much of the image they cover', () => {
    const [first] = extract(
      pixels([
        ['#3355cc', 40],
        ['#cc3344', 400],
      ]),
      2,
    )
    expect(first).toBe('#cc3344')
  })

  it('ignores near-white, near-black and grey, which say nothing about a brand', () => {
    const result = extract(
      pixels([
        ['#ffffff', 900],
        ['#000000', 900],
        ['#7f7f7f', 900],
        ['#cc3344', 50],
      ]),
      3,
    )
    expect(result).toEqual(['#cc3344'])
  })

  it('can be told to keep the extremes', () => {
    const result = extractPalette(pixels([['#ffffff', 100]]), {
      count: 2,
      stride: 1,
      ignoreExtremes: false,
    })
    expect(result).toContain('#ffffff')
  })

  it('skips transparent pixels', () => {
    const data = new Uint8ClampedArray([204, 51, 68, 0, 51, 85, 204, 255])
    expect(extract(data, 2)).toEqual(['#3355cc'])
  })

  it('is deterministic, so a saved preset reproduces exactly', () => {
    const data = pixels([
      ['#cc3344', 120],
      ['#3355cc', 90],
      ['#33aa66', 60],
      ['#aa8833', 30],
    ])
    expect(extract(data, 4)).toEqual(extract(data, 4))
  })

  it('returns nothing for an empty or fully filtered image rather than throwing', () => {
    expect(extract(new Uint8ClampedArray([]))).toEqual([])
    expect(extract(pixels([['#ffffff', 50]]))).toEqual([])
  })

  it('never returns more colours than asked for', () => {
    const data = pixels([
      ['#cc3344', 40],
      ['#3355cc', 40],
      ['#33aa66', 40],
      ['#aa8833', 40],
      ['#8833aa', 40],
    ])
    expect(extract(data, 3).length).toBeLessThanOrEqual(3)
  })

  it('does not invent colours when the image has fewer than requested', () => {
    const result = extract(pixels([['#cc3344', 200]]), 5)
    for (const hex of result) {
      const { r, g, b } = hexToRgb(hex)
      expect(Math.abs(r - 204)).toBeLessThan(3)
      expect(Math.abs(g - 51)).toBeLessThan(3)
      expect(Math.abs(b - 68)).toBeLessThan(3)
    }
  })

  it('emits only valid hex strings', () => {
    const data = pixels([
      ['#cc3344', 100],
      ['#3355cc', 100],
    ])
    for (const hex of extract(data, 4)) {
      expect(hex).toMatch(/^#[\da-f]{6}$/)
    }
  })
})
