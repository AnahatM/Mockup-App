import { describe, expect, it } from 'vitest'
import { hexToRgb, isHex, mix, normalizeHex, rgbToHex } from './hex'

describe('normalizeHex', () => {
  it('accepts shorthand, long form, and a missing hash', () => {
    expect(normalizeHex('#abc')).toBe('#aabbcc')
    expect(normalizeHex('abc')).toBe('#aabbcc')
    expect(normalizeHex('#AABBCC')).toBe('#aabbcc')
    expect(normalizeHex('  #1a1a18 ')).toBe('#1a1a18')
  })

  it('rejects anything unparseable rather than guessing', () => {
    for (const bad of ['', '#', '#ab', '#abcd', 'nope', '#gggggg', 'rgb(1,2,3)']) {
      expect(normalizeHex(bad), bad).toBeNull()
    }
  })

  it('backs isHex', () => {
    expect(isHex('#fff')).toBe(true)
    expect(isHex('fff0')).toBe(false)
  })
})

describe('hexToRgb / rgbToHex', () => {
  it('round-trips', () => {
    for (const hex of ['#000000', '#ffffff', '#1a1a18', '#6a7ca8']) {
      expect(rgbToHex(hexToRgb(hex))).toBe(hex)
    }
  })

  it('clamps out-of-range channels instead of producing invalid hex', () => {
    expect(rgbToHex({ r: -20, g: 300, b: 12.6 })).toBe('#00ff0d')
  })
})

describe('mix', () => {
  it('returns the endpoints at t=0 and t=1', () => {
    expect(mix('#112233', '#ffffff', 0)).toBe('#112233')
    expect(mix('#112233', '#ffffff', 1)).toBe('#ffffff')
  })

  it('clamps t outside 0-1', () => {
    expect(mix('#112233', '#ffffff', -5)).toBe('#112233')
    expect(mix('#112233', '#ffffff', 5)).toBe('#ffffff')
  })

  it('darkens toward black monotonically', () => {
    const steps = [0, 0.25, 0.5, 0.75, 1].map(
      (t) => hexToRgb(mix('#c3bdb3', '#000000', t)).r,
    )
    for (let i = 1; i < steps.length; i += 1) {
      expect(steps[i]!).toBeLessThan(steps[i - 1]!)
    }
  })

  it('blends in linear light, so the midpoint is brighter than a naive average', () => {
    // A gamma-space average of black and white gives 128; linear-light gives ~188.
    expect(hexToRgb(mix('#000000', '#ffffff', 0.5)).r).toBeGreaterThan(150)
  })
})
