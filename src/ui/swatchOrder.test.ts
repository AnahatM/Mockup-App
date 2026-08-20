import { describe, expect, it } from 'vitest'
import { orderBySelection } from './swatchOrder'
import type { SwatchOption } from './SwatchGrid'

const options: SwatchOption[] = ['a', 'b', 'c', 'd', 'e'].map((id) => ({
  id,
  color: `#00000${id.charCodeAt(0) % 10}`,
  label: id.toUpperCase(),
}))

const ids = (list: readonly SwatchOption[]) => list.map((option) => option.id)

describe('orderBySelection', () => {
  it('moves the selected swatch to the front', () => {
    expect(ids(orderBySelection(options, 'd'))).toEqual(['d', 'a', 'b', 'c', 'e'])
  })

  it('keeps the declared order of everything else', () => {
    expect(ids(orderBySelection(options, 'c'))).toEqual(['c', 'a', 'b', 'd', 'e'])
  })

  it('leaves the list alone when the selection is already first', () => {
    expect(ids(orderBySelection(options, 'a'))).toEqual(['a', 'b', 'c', 'd', 'e'])
  })

  it('leaves the list alone when nothing is selected', () => {
    expect(ids(orderBySelection(options, undefined))).toEqual(ids(options))
  })

  it('leaves the list alone when the selection is not in it', () => {
    expect(ids(orderBySelection(options, 'zzz'))).toEqual(ids(options))
  })

  it('never drops or duplicates a swatch', () => {
    for (const option of options) {
      const result = orderBySelection(options, option.id)
      expect(result).toHaveLength(options.length)
      expect(new Set(ids(result)).size).toBe(options.length)
    }
  })

  it('guarantees the selection survives a collapse to four', () => {
    // The whole point: the applied colour must be visible without expanding.
    const collapsed = orderBySelection(options, 'e').slice(0, 4)
    expect(ids(collapsed)).toContain('e')
  })

  it('handles an empty palette', () => {
    expect(orderBySelection([], 'a')).toEqual([])
  })
})
