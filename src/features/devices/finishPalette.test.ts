import { describe, expect, it } from 'vitest'
import { deviceFinishPalette } from './finishPalette'
import { DEVICES } from './spec/registry'

describe('deviceFinishPalette', () => {
  const palette = deviceFinishPalette()

  it('offers finishes from the catalogue', () => {
    expect(palette.length).toBeGreaterThan(0)
  })

  it('deduplicates colours shared between devices', () => {
    const bodies = palette.map((paint) => paint.body.toLowerCase())
    expect(new Set(bodies).size).toBe(bodies.length)
  })

  it('gives every entry a unique id', () => {
    const ids = palette.map((paint) => paint.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps the authored finish name, not a generated one', () => {
    const authored = DEVICES.flatMap((d) => d.colorways.map((c) => c.label))
    for (const paint of palette) expect(authored).toContain(paint.label)
  })

  it('carries a valid hex for every finish', () => {
    for (const paint of palette) expect(paint.body).toMatch(/^#[\da-f]{6}$/i)
  })

  it('covers every distinct colour in the catalogue — nothing is dropped', () => {
    const distinct = new Set(
      DEVICES.flatMap((d) => d.colorways.map((c) => c.body.toLowerCase())),
    )
    expect(palette).toHaveLength(distinct.size)
  })
})
