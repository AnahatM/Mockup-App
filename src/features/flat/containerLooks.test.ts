import { describe, expect, it } from 'vitest'
import { CONTAINER_LOOKS, resolveContainerLook } from './containerLooks'
import { CONTAINER_STYLES } from './schema'

describe('resolveContainerLook', () => {
  it.each(CONTAINER_STYLES)('resolves a complete parameter set for "%s"', (style) => {
    const look = resolveContainerLook(style)
    expect(look.chromeOpacity).toBeGreaterThanOrEqual(0)
    expect(look.chromeOpacity).toBeLessThanOrEqual(1)
    expect(look.borderOpacity).toBeGreaterThanOrEqual(0)
    expect(look.borderWidth).toBeGreaterThanOrEqual(0)
    expect(['light', 'dark']).toContain(look.tone)
    expect(look.sheenOpacity).toBeGreaterThanOrEqual(0)
    expect(look.recessOpacity).toBeGreaterThanOrEqual(0)
  })

  it('covers every declared container style with its own entry', () => {
    expect(Object.keys(CONTAINER_LOOKS).sort()).toEqual([...CONTAINER_STYLES].sort())
  })

  it('draws no border, sheen or recess for the default look', () => {
    const look = resolveContainerLook('default')
    expect(look.chromeOpacity).toBe(1)
    expect(look.borderOpacity).toBe(0)
    expect(look.sheenOpacity).toBe(0)
    expect(look.recessOpacity).toBe(0)
  })

  it('turns down chrome opacity for glass looks, unlike inset and border looks', () => {
    expect(resolveContainerLook('glass-light').chromeOpacity).toBeLessThan(1)
    expect(resolveContainerLook('glass-dark').chromeOpacity).toBeLessThan(1)
    expect(resolveContainerLook('inset-light').chromeOpacity).toBe(1)
    expect(resolveContainerLook('border').chromeOpacity).toBe(1)
  })

  it('gives glass looks a sheen and inset looks a recess, but not both', () => {
    expect(resolveContainerLook('glass-light').sheenOpacity).toBeGreaterThan(0)
    expect(resolveContainerLook('glass-light').recessOpacity).toBe(0)
    expect(resolveContainerLook('inset-dark').recessOpacity).toBeGreaterThan(0)
    expect(resolveContainerLook('inset-dark').sheenOpacity).toBe(0)
  })

  it('makes the border look thicker and more opaque than outline', () => {
    const outline = resolveContainerLook('outline')
    const border = resolveContainerLook('border')
    expect(border.borderWidth).toBeGreaterThan(outline.borderWidth)
    expect(border.borderOpacity).toBeGreaterThan(outline.borderOpacity)
  })

  it('gives the light and dark variant of a style different tones', () => {
    expect(resolveContainerLook('glass-light').tone).toBe('light')
    expect(resolveContainerLook('glass-dark').tone).toBe('dark')
    expect(resolveContainerLook('inset-light').tone).toBe('light')
    expect(resolveContainerLook('inset-dark').tone).toBe('dark')
  })
})
