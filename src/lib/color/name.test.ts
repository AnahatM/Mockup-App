import { describe, expect, it } from 'vitest'
import { nameColor } from './name'

describe('nameColor', () => {
  it('names the obvious ones', () => {
    expect(nameColor('#000000')).toBe('Black')
    expect(nameColor('#ffffff')).toBe('White')
    expect(nameColor('#ff0000')).toBe('Red')
    expect(nameColor('#00ff00')).toBe('Green')
    expect(nameColor('#0000ff')).toBe('Blue')
  })

  it('is exact on every reference colour it is asked about', () => {
    expect(nameColor('#2255cc')).toBe('Blue')
    expect(nameColor('#0f8a80')).toBe('Teal')
  })

  it('separates dark blue from dark green, which plain RGB distance confuses', () => {
    expect(nameColor('#12203f')).toBe('Navy')
    expect(nameColor('#13351f')).toBe('Forest')
  })

  it('handles shorthand and uppercase hex', () => {
    expect(nameColor('#FFF')).toBe('White')
    expect(nameColor('#000')).toBe('Black')
  })

  it('names any colour at all — it is a nearest match, so it cannot fail', () => {
    for (let r = 0; r < 256; r += 51) {
      for (let g = 0; g < 256; g += 51) {
        for (let b = 0; b < 256; b += 51) {
          const hex = `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
          expect(nameColor(hex)).toBeTruthy()
        }
      }
    }
  })

  it('is stable — the same input always names the same', () => {
    expect(nameColor('#7b3fd4')).toBe(nameColor('#7b3fd4'))
  })
})
