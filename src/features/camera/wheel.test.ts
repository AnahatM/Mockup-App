import { describe, expect, it } from 'vitest'
import { normalizeWheelDelta } from './wheel'

describe('normalizeWheelDelta', () => {
  it('passes pixel deltas (deltaMode 0) through unchanged, within the clamp', () => {
    expect(normalizeWheelDelta(40, 0)).toBe(40)
    expect(normalizeWheelDelta(-40, 0)).toBe(-40)
  })

  it('scales line deltas (deltaMode 1) up toward pixel magnitude', () => {
    expect(normalizeWheelDelta(3, 1)).toBe(48)
  })

  it('clamps a very large delta so one flick cannot jump too far', () => {
    expect(normalizeWheelDelta(10000, 0)).toBe(120)
    expect(normalizeWheelDelta(-10000, 0)).toBe(-120)
  })

  it('many small unclamped deltas sum to the same total as one equivalent large one', () => {
    // A trackpad reporting the same physical scroll distance as a mouse wheel
    // splits it into many small events rather than one or two large ones. A
    // caller that scales each event by its own magnitude (as `dolly`/
    // `wheelDollyDistance` do) therefore ends up at the same total either
    // way; a caller that instead treated every event as one fixed-size
    // "tick" would move the trackpad roughly 10x as far for this example.
    const trackpadTotal = Array.from({ length: 5 }, () => normalizeWheelDelta(10, 0)).reduce(
      (a, b) => a + b,
      0,
    )
    const mouseTotal = normalizeWheelDelta(50, 0)
    expect(trackpadTotal).toBe(mouseTotal)
  })
})
