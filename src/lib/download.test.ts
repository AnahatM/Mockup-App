import { describe, expect, it } from 'vitest'
import { safeFilename, withExtension } from './download'

describe('safeFilename', () => {
  it('replaces characters that are illegal in filenames', () => {
    expect(safeFilename('my/mock:up*name')).toBe('my-mock-up-name')
    expect(safeFilename('a<b>c|d"e')).toBe('a-b-c-d-e')
    expect(safeFilename('back\\slash')).toBe('back-slash')
  })

  it('keeps ordinary names untouched', () => {
    expect(safeFilename('hero-shot_v2')).toBe('hero-shot_v2')
    expect(safeFilename('Mockup 2026')).toBe('Mockup 2026')
  })

  it('collapses runs of separators instead of leaving a row of dashes', () => {
    expect(safeFilename('a///b')).toBe('a-b')
    expect(safeFilename('a::??b')).toBe('a-b')
  })

  it('trims leading and trailing punctuation', () => {
    expect(safeFilename('  hero  ')).toBe('hero')
    expect(safeFilename('/hero/')).toBe('hero')
    expect(safeFilename('...hero...')).toBe('hero')
  })

  it('falls back when nothing usable survives', () => {
    expect(safeFilename('')).toBe('mockup')
    expect(safeFilename('   ')).toBe('mockup')
    // Without trimming, this would collapse to a bare "-" and slip past the
    // emptiness check, producing a file literally named "-".
    expect(safeFilename('///', 'render')).toBe('render')
    expect(safeFilename('<<>>')).toBe('mockup')
  })

  it('never returns a name still containing an illegal character', () => {
    for (const input of ['a/b', 'a:b', 'a*b', 'a?b', 'a"b', 'a<b', 'a>b', 'a|b']) {
      expect(safeFilename(input)).not.toMatch(/[\\/:*?"<>|]/)
    }
  })
})

describe('withExtension', () => {
  it('appends the extension when missing', () => {
    expect(withExtension('hero', 'png')).toBe('hero.png')
  })

  it('does not double up an existing extension, whatever its case', () => {
    expect(withExtension('hero.png', 'png')).toBe('hero.png')
    expect(withExtension('hero.PNG', 'png')).toBe('hero.PNG')
  })

  it('leaves a different extension in place and adds the new one', () => {
    expect(withExtension('hero.webm', 'png')).toBe('hero.webm.png')
  })
})
