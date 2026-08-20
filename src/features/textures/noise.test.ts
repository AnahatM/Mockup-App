import { describe, expect, it } from 'vitest'
import { fractalNoise, hash2, latticeNoise } from './noise'

describe('hash2', () => {
  it('is deterministic for the same inputs', () => {
    expect(hash2(3, 7, 42)).toBe(hash2(3, 7, 42))
  })

  it('stays within [0, 1)', () => {
    for (let i = 0; i < 200; i += 1) {
      const value = hash2(i, i * 3 - 5, 11)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('differs across seeds', () => {
    const seeds = [1, 2, 3, 4, 5].map((seed) => hash2(10, 20, seed))
    expect(new Set(seeds).size).toBe(seeds.length)
  })
})

describe('latticeNoise', () => {
  it('is deterministic for the same inputs', () => {
    expect(latticeNoise(0.31, 0.62, 6, 6, 5)).toBe(latticeNoise(0.31, 0.62, 6, 6, 5))
  })

  it('stays within [0, 1]', () => {
    for (let i = 0; i < 100; i += 1) {
      const u = (i * 0.0173) % 1
      const v = (i * 0.0791) % 1
      const value = latticeNoise(u, v, 5, 9, 3)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })

  it('tiles seamlessly: u=0 and u=1 land on the same lattice column', () => {
    for (let i = 0; i < 20; i += 1) {
      const v = i / 20
      expect(latticeNoise(1, v, 8, 8, 2)).toBeCloseTo(latticeNoise(0, v, 8, 8, 2), 10)
    }
  })

  it('tiles seamlessly: v=0 and v=1 land on the same lattice row', () => {
    for (let i = 0; i < 20; i += 1) {
      const u = i / 20
      expect(latticeNoise(u, 1, 6, 6, 2)).toBeCloseTo(latticeNoise(u, 0, 6, 6, 2), 10)
    }
  })

  it('differs across seeds for the same position', () => {
    const values = [1, 2, 3].map((seed) => latticeNoise(0.4, 0.4, 6, 6, seed))
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('fractalNoise', () => {
  it('is deterministic and bounded', () => {
    for (let i = 0; i < 50; i += 1) {
      const u = (i * 0.037) % 1
      const v = (i * 0.081) % 1
      const value = fractalNoise(u, v, 4, 4, 7, 4)
      expect(fractalNoise(u, v, 4, 4, 7, 4)).toBe(value)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })

  it('tiles seamlessly across octaves', () => {
    for (let i = 0; i < 10; i += 1) {
      const v = i / 10
      expect(fractalNoise(1, v, 4, 4, 3, 4)).toBeCloseTo(fractalNoise(0, v, 4, 4, 3, 4), 10)
    }
  })
})
