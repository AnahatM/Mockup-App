import { describe, expect, it } from 'vitest'
import { wrapText, type Measure } from './textWrap'

/** 1px per character — deterministic and easy to reason about in assertions. */
const measure: Measure = (text) => text.length

describe('wrapText', () => {
  it('returns nothing for empty or whitespace-only input', () => {
    expect(wrapText(measure, '', 100)).toEqual([])
    expect(wrapText(measure, '   ', 100)).toEqual([])
  })

  it('keeps a short line on one line', () => {
    expect(wrapText(measure, 'Ship it', 100)).toEqual(['Ship it'])
  })

  it('wraps onto multiple lines once the width is exceeded', () => {
    // "one two three four" — wrap at width 7 forces roughly two words per line.
    expect(wrapText(measure, 'one two three four', 7)).toEqual(['one two', 'three', 'four'])
  })

  it('gives an over-long single word its own line rather than splitting it', () => {
    expect(wrapText(measure, 'supercalifragilistic word', 5)).toEqual([
      'supercalifragilistic',
      'word',
    ])
  })

  it('treats explicit newlines as paragraph breaks', () => {
    expect(wrapText(measure, 'first line\nsecond line', 200)).toEqual([
      'first line',
      'second line',
    ])
  })

  it('collapses runs of whitespace within a paragraph', () => {
    expect(wrapText(measure, 'a    b     c', 200)).toEqual(['a b c'])
  })

  it('ignores blank paragraphs produced by consecutive newlines', () => {
    expect(wrapText(measure, 'a\n\n\nb', 200)).toEqual(['a', 'b'])
  })
})
