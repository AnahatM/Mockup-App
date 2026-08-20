import { describe, expect, it } from 'vitest'
import { pickDefaultScreenMesh } from './screenHeuristic'

describe('pickDefaultScreenMesh', () => {
  it('picks a mesh named exactly "screen"', () => {
    expect(pickDefaultScreenMesh(['Body', 'Screen', 'Frame'])).toBe('Screen')
  })

  it('is case-insensitive', () => {
    expect(pickDefaultScreenMesh(['BODY', 'SCREEN'])).toBe('SCREEN')
  })

  it('matches a mesh whose name merely contains a keyword', () => {
    expect(pickDefaultScreenMesh(['Body_Mesh', 'Display_Panel_001'])).toBe(
      'Display_Panel_001',
    )
  })

  it('prefers an exact keyword match over a partial one', () => {
    expect(pickDefaultScreenMesh(['Front_Glass_Cover', 'Screen'])).toBe('Screen')
  })

  it('tries keywords in priority order when nothing is exact', () => {
    // "display" should be found before "glass" — the loop checks screen,
    // display, lcd, panel, glass in that order.
    expect(pickDefaultScreenMesh(['Back_Glass', 'Front_Display'])).toBe('Front_Display')
  })

  it('returns null when nothing looks like a screen', () => {
    expect(pickDefaultScreenMesh(['Body', 'Frame', 'Button_01'])).toBeNull()
  })

  it('returns null for an empty list', () => {
    expect(pickDefaultScreenMesh([])).toBeNull()
  })

  it('tolerates surrounding whitespace', () => {
    expect(pickDefaultScreenMesh(['  Screen  '])).toBe('  Screen  ')
  })
})
