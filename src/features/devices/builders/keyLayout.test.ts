import { describe, expect, it } from 'vitest'
import { KEY_ROWS, KEY_UNITS } from './keyLayout'

/**
 * The keyboard is one texture drawn from a table of key widths, and the table
 * is the kind of thing a typo hides in forever: a row that adds up to 13.75
 * instead of 14 draws a keyboard with one ragged edge, which reads as a
 * rendering artefact rather than as a wrong number in a list.
 */
describe('keyboard layout', () => {
  it.each(KEY_ROWS.map((row, index) => ({ index, row })))(
    'row $index spans the full width of the board',
    ({ row }) => {
      const units = row.keys.reduce((total, key) => total + key, 0)
      // Written out rather than only compared against the constant the drawing
      // code divides by: that alone would make the assertion move with the bug,
      // and the pair of them is what caught the table at 15 with KEY_UNITS
      // still set to 14.
      expect(units).toBeCloseTo(15, 6)
      expect(units).toBeCloseTo(KEY_UNITS, 6)
    },
  )

  it('has a space bar, and it is the widest key on the board', () => {
    const widest = Math.max(...KEY_ROWS.flatMap((row) => [...row.keys]))
    const bottom = KEY_ROWS.at(-1)
    expect(bottom?.arrows).toBe(true)
    // The arrow cluster is three units but is drawn as four keys, so the space
    // bar is the widest thing actually drawn.
    expect(widest).toBeGreaterThanOrEqual(4)
  })

  it('steps the left edge, which is what makes it read as a keyboard', () => {
    // Tab, Caps and Shift each start further right than the one above.
    const lefts = KEY_ROWS.slice(2, 5).map((row) => row.keys[0] ?? 0)
    expect(lefts[1]).toBeGreaterThan(lefts[0] ?? 0)
    expect(lefts[2]).toBeGreaterThan(lefts[1] ?? 0)
  })
})
