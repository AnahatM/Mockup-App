import { describe, expect, it } from 'vitest'
import { groupItems, orderedItems, rankItems, scoreItem } from './rank'
import type { SearchGroup, SearchItem } from './types'

const item = (over: Partial<SearchItem> & { title: string }): SearchItem => ({
  id: over.title,
  group: 'Settings',
  icon: 'sliders',
  ...over,
})

describe('scoreItem', () => {
  it('ranks an exact title above a prefix above a substring', () => {
    const exact = scoreItem(item({ title: 'Bloom' }), 'bloom')
    const prefix = scoreItem(item({ title: 'Bloom amount' }), 'bloom')
    const inside = scoreItem(item({ title: 'Enable bloom pass' }), 'bloom')
    expect(exact).toBeGreaterThan(prefix)
    expect(prefix).toBeGreaterThan(inside)
  })

  it('is case-insensitive and ignores surrounding whitespace', () => {
    expect(scoreItem(item({ title: 'Exposure' }), '  ExPoSuRe ')).toBe(100)
  })

  it('matches on keywords when the title does not contain the term', () => {
    const withKeyword = item({ title: 'Backdrop', keywords: ['background'] })
    expect(scoreItem(withKeyword, 'background')).toBeGreaterThan(0)
    expect(scoreItem(item({ title: 'Backdrop' }), 'background')).toBe(0)
  })

  it('matches multiple words in any order within the title', () => {
    expect(scoreItem(item({ title: 'Bloom threshold' }), 'threshold bloom')).toBeGreaterThan(0)
  })

  it('returns a match for everything when the query is empty', () => {
    expect(scoreItem(item({ title: 'Anything' }), '')).toBe(1)
    expect(scoreItem(item({ title: 'Anything' }), '   ')).toBe(1)
  })

  it('returns zero when nothing matches', () => {
    expect(scoreItem(item({ title: 'Exposure' }), 'zzzz')).toBe(0)
  })
})

describe('rankItems', () => {
  const items = [
    item({ title: 'Bloom amount' }),
    item({ title: 'Bloom' }),
    item({ title: 'Vignette' }),
  ]

  it('puts the best match first', () => {
    expect(rankItems(items, 'bloom')[0]?.title).toBe('Bloom')
  })

  it('drops non-matches entirely', () => {
    expect(rankItems(items, 'bloom').map((i) => i.title)).not.toContain('Vignette')
  })

  it('honours the limit', () => {
    expect(rankItems(items, '', 2)).toHaveLength(2)
  })

  it('breaks ties by group order, then alphabetically', () => {
    const tied = [
      item({ title: 'Zeta', group: 'Devices' }),
      item({ title: 'Alpha', group: 'Devices' }),
      item({ title: 'Middle', group: 'Settings' }),
    ]
    // Equal scores on an empty query, so ordering is entirely the tiebreak.
    expect(rankItems(tied, '').map((i) => i.title)).toEqual(['Middle', 'Alpha', 'Zeta'])
  })
})

describe('grouping', () => {
  const items = [
    item({ title: 'A doc', group: 'Documentation' }),
    item({ title: 'A setting', group: 'Settings' }),
    item({ title: 'A device', group: 'Devices' }),
  ]

  it('orders groups consistently regardless of input order', () => {
    expect(groupItems(items).map((g) => g.group)).toEqual([
      'Settings',
      'Devices',
      'Documentation',
    ])
  })

  it('omits groups with no results', () => {
    expect(groupItems([items[1]!]).map((g) => g.group)).toEqual(['Settings'])
  })

  it('flattens in render order, which is what the keyboard cursor follows', () => {
    expect(orderedItems(items).map((i) => i.title)).toEqual([
      'A setting',
      'A device',
      'A doc',
    ])
  })
})

describe('the empty query', () => {
  const many = (group: SearchGroup, count: number): SearchItem[] =>
    Array.from({ length: count }, (_, i) => ({
      id: `${group}-${i}`,
      title: `${group} ${i}`,
      group,
      icon: 'phone' as const,
    }))

  const index = [
    ...many('Settings', 200),
    ...many('Devices', 14),
    ...many('Presets', 12),
    ...many('Documentation', 17),
    ...many('Pages', 10),
  ]

  it('advertises every group instead of filling up with the first one', () => {
    const groups = new Set(rankItems(index, '').map((item) => item.group))
    expect(groups).toEqual(
      new Set(['Settings', 'Devices', 'Presets', 'Documentation', 'Pages']),
    )
  })

  it('gives each group an equal share', () => {
    const counts = new Map<string, number>()
    for (const item of rankItems(index, '', 40)) {
      counts.set(item.group, (counts.get(item.group) ?? 0) + 1)
    }
    expect([...counts.values()]).toEqual([8, 8, 8, 8, 8])
  })

  it('does not invent items for a group that has fewer than its share', () => {
    const sparse = [...many('Settings', 50), ...many('Pages', 2)]
    const pages = rankItems(sparse, '', 40).filter((i) => i.group === 'Pages')
    expect(pages).toHaveLength(2)
  })

  it('still ranks normally once something is typed', () => {
    expect(rankItems(index, 'Devices 3')[0]?.title).toBe('Devices 3')
  })
})
