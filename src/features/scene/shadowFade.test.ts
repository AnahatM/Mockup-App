import { describe, expect, it } from 'vitest'
import { shadowFade } from './shadowFade'

/**
 * The Low hero preset sits twelve degrees below the floor, so the contact
 * shadow's plane is seen from underneath and compresses into a hard grey
 * streak running well past the product — it reads as a scratch on the render.
 */
describe('contact shadow at grazing angles', () => {
  /** A camera four units out, at the height that makes a given elevation. */
  const atElevation = (degrees: number): number =>
    shadowFade(4 * Math.tan((degrees * Math.PI) / 180), 4)

  it('is gone by the time the camera reaches the floor', () => {
    expect(atElevation(0)).toBe(0)
  })

  it('stays gone underneath it', () => {
    // Low hero is -12 degrees, and `orbitBelowFloor` allows the whole way under.
    expect(atElevation(-12)).toBe(0)
    expect(atElevation(-80)).toBe(0)
  })

  it('is at full strength for every preset above the floor', () => {
    // The lowest of those is Hero, at 12 degrees... which is inside the fade
    // band on purpose: at 12 degrees the plane is already thin enough to
    // streak. Full strength is reached shortly above it.
    expect(atElevation(14)).toBe(1)
    expect(atElevation(26)).toBe(1)
    expect(atElevation(72)).toBe(1)
  })

  it('eases rather than switching, so an orbit does not blink', () => {
    const band = [2, 4, 6, 8, 10, 12].map(atElevation)
    for (let i = 1; i < band.length; i += 1) {
      expect(band[i] ?? 0).toBeGreaterThan(band[i - 1] ?? 0)
    }
    expect(band[0]).toBeGreaterThan(0)
    expect(band.at(-1)).toBeLessThan(1)
  })

  it('keeps the shadow when the camera is directly overhead', () => {
    // Horizontal distance zero would divide by zero on the way to the sine.
    expect(shadowFade(6, 0)).toBe(1)
    expect(shadowFade(-6, 0)).toBe(0)
  })
})
