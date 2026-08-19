import { describe, expect, it } from 'vitest'
import { moveToFront, recentIdFor, upsertRecent, type RecentUpload } from './recents'

function entry(id: string): RecentUpload {
  return {
    id,
    kind: 'image',
    name: `${id}.png`,
    url: `blob:${id}`,
    thumbnail: `data:${id}`,
    width: 100,
    height: 200,
    palette: [],
  }
}

describe('upsertRecent', () => {
  it('adds a new entry to the front', () => {
    const { next, evicted } = upsertRecent([entry('a')], entry('b'), 5)
    expect(next.map((e) => e.id)).toEqual(['b', 'a'])
    expect(evicted).toEqual([])
  })

  it('moves a re-uploaded (duplicate id) entry to the front instead of duplicating it', () => {
    const list = [entry('a'), entry('b'), entry('c')]
    const { next, evicted } = upsertRecent(list, entry('b'), 5)
    expect(next.map((e) => e.id)).toEqual(['b', 'a', 'c'])
    expect(next).toHaveLength(3)
    // The replaced entry is reported as evicted so its object URL is revoked.
    expect(evicted.map((e) => e.id)).toEqual(['b'])
  })

  it('evicts the oldest entries once the cap is exceeded', () => {
    const list = [entry('a'), entry('b'), entry('c')]
    const { next, evicted } = upsertRecent(list, entry('d'), 3)
    expect(next.map((e) => e.id)).toEqual(['d', 'a', 'b'])
    expect(evicted.map((e) => e.id)).toEqual(['c'])
  })

  it('never exceeds the cap', () => {
    let list: RecentUpload[] = []
    let allEvicted: RecentUpload[] = []
    for (const id of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      const result = upsertRecent(list, entry(id), 5)
      list = result.next
      allEvicted = [...allEvicted, ...result.evicted]
    }
    expect(list).toHaveLength(5)
    expect(list.map((e) => e.id)).toEqual(['g', 'f', 'e', 'd', 'c'])
    expect(allEvicted.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('does not mutate the input list', () => {
    const list = [entry('a'), entry('b')]
    const snapshot = [...list]
    upsertRecent(list, entry('c'), 5)
    expect(list).toEqual(snapshot)
  })
})

describe('moveToFront', () => {
  it('moves a middle entry to the front, preserving the rest of the order', () => {
    const list = [entry('a'), entry('b'), entry('c')]
    expect(moveToFront(list, 'b').map((e) => e.id)).toEqual(['b', 'a', 'c'])
  })

  it('is a no-op copy when the entry is already at the front', () => {
    const list = [entry('a'), entry('b')]
    const result = moveToFront(list, 'a')
    expect(result.map((e) => e.id)).toEqual(['a', 'b'])
    expect(result).not.toBe(list)
  })

  it('is a no-op copy when the id is not found', () => {
    const list = [entry('a'), entry('b')]
    expect(moveToFront(list, 'missing').map((e) => e.id)).toEqual(['a', 'b'])
  })
})

describe('recentIdFor', () => {
  it('is stable for the same file identity', () => {
    const file = { name: 'shot.png', size: 1234, lastModified: 999 }
    expect(recentIdFor(file)).toBe(recentIdFor({ ...file }))
  })

  it('differs when name, size or lastModified differ', () => {
    const base = { name: 'shot.png', size: 1234, lastModified: 999 }
    expect(recentIdFor(base)).not.toBe(recentIdFor({ ...base, name: 'other.png' }))
    expect(recentIdFor(base)).not.toBe(recentIdFor({ ...base, size: 5678 }))
    expect(recentIdFor(base)).not.toBe(recentIdFor({ ...base, lastModified: 1 }))
  })
})
