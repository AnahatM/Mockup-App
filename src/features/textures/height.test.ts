import { describe, expect, it } from 'vitest'
import { surfaceHeight, type HeightConfig } from './height'
import { TEXTURE_KINDS, type SurfaceTextureKind } from './schema'

const PATTERN_KINDS = TEXTURE_KINDS.filter(
  (kind): kind is Exclude<SurfaceTextureKind, 'none'> => kind !== 'none',
)

const cfg = (overrides: Partial<HeightConfig> = {}): HeightConfig => ({
  seed: 1,
  scale: 2,
  direction: 'vertical',
  ...overrides,
})

const sampleAt = (kind: SurfaceTextureKind, px: number, py: number, size: number, c: HeightConfig) =>
  surfaceHeight(kind, { u: px / size, v: py / size, px, py, size }, c)

describe('surfaceHeight', () => {
  const size = 64

  it.each(PATTERN_KINDS)('%s is deterministic for the same inputs', (kind) => {
    const c = cfg({ seed: 9 })
    expect(sampleAt(kind, 17, 40, size, c)).toBe(sampleAt(kind, 17, 40, size, c))
  })

  it.each(PATTERN_KINDS)('%s stays within [0, 1]', (kind) => {
    const c = cfg({ seed: 3 })
    for (let py = 0; py < size; py += 7) {
      for (let px = 0; px < size; px += 7) {
        const value = sampleAt(kind, px, py, size, c)
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(1)
      }
    }
  })

  it.each(PATTERN_KINDS)('%s differs across seeds', (kind) => {
    const values = [1, 2, 3].map((seed) => sampleAt(kind, 12, 12, size, cfg({ seed })))
    expect(new Set(values).size).toBeGreaterThan(1)
  })

  // Grain is per-pixel block noise: a seam there is not a meaningful concept,
  // so only the lattice-based patterns are checked for tiling.
  const TILED_KINDS: SurfaceTextureKind[] = ['noise', 'brushed', 'scratches', 'weave']

  it.each(TILED_KINDS)('%s tiles seamlessly at the u=0/u=1 edge', (kind) => {
    const c = cfg({ seed: 4 })
    for (let py = 0; py < size; py += 5) {
      const left = surfaceHeight(kind, { u: 0, v: py / size, px: 0, py, size }, c)
      const right = surfaceHeight(kind, { u: 1, v: py / size, px: size, py, size }, c)
      expect(right).toBeCloseTo(left, 10)
    }
  })

  it('none is a flat mid-grey', () => {
    expect(sampleAt('none', 5, 5, size, cfg())).toBe(0.5)
  })
})
