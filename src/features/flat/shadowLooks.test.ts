import { describe, expect, it } from 'vitest'
import { resolveShadowLook, shadowColor } from './shadowLooks'

describe('resolveShadowLook', () => {
  it.each(['spread', 'hug', 'adaptive'] as const)(
    'resolves a complete parameter set for "%s"',
    (style) => {
      const look = resolveShadowLook(style)
      expect(look.blur).toBeGreaterThan(0)
      expect(look.offsetY).toBeGreaterThan(0)
      expect(look.spread).toBeGreaterThanOrEqual(0)
      expect(['black', 'adaptive']).toContain(look.colorMode)
    },
  )

  it('spreads and blurs more than hug, which reads as a tight contact shadow', () => {
    const spread = resolveShadowLook('spread')
    const hug = resolveShadowLook('hug')
    expect(spread.spread).toBeGreaterThan(hug.spread)
    expect(spread.blur).toBeGreaterThan(hug.blur)
    expect(spread.offsetY).toBeGreaterThan(hug.offsetY)
  })

  it('shares its geometry with spread, but takes its colour from the screenshot', () => {
    const spread = resolveShadowLook('spread')
    const adaptive = resolveShadowLook('adaptive')
    expect(adaptive.blur).toBe(spread.blur)
    expect(adaptive.offsetY).toBe(spread.offsetY)
    expect(adaptive.spread).toBe(spread.spread)
    expect(adaptive.colorMode).toBe('adaptive')
    expect(spread.colorMode).toBe('black')
  })
})

describe('shadowColor', () => {
  it('is black for a non-adaptive style, regardless of the dominant colour', () => {
    const look = resolveShadowLook('spread')
    expect(shadowColor(look, 0.4, '#ff0000')).toBe('rgba(0, 0, 0, 0.4)')
    expect(shadowColor(look, 0.4, null)).toBe('rgba(0, 0, 0, 0.4)')
  })

  it('takes the dominant colour for the adaptive style', () => {
    const look = resolveShadowLook('adaptive')
    expect(shadowColor(look, 0.5, '#ff0000')).toBe('rgba(255, 0, 0, 0.5)')
  })

  it('falls back to black when adaptive but nothing has been uploaded yet', () => {
    const look = resolveShadowLook('adaptive')
    expect(shadowColor(look, 0.5, null)).toBe('rgba(0, 0, 0, 0.5)')
  })
})
