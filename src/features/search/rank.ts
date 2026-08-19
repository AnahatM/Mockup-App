import type { SearchItem } from './types'
import { SEARCH_GROUPS } from './types'

/**
 * Search ranking.
 *
 * Deliberately substring scoring rather than a fuzzy-match library. The index is
 * a few hundred items — settings, devices, presets, documentation — and people
 * search for the name of a thing they know exists. Fuzzy matching would mostly
 * add false positives and a dependency.
 */

const haystacks = new WeakMap<SearchItem, string>()

function haystack(item: SearchItem): string {
  let text = haystacks.get(item)
  if (text === undefined) {
    text = [item.title, item.subtitle ?? '', ...(item.keywords ?? [])]
      .join(' ')
      .toLowerCase()
    haystacks.set(item, text)
  }
  return text
}

/** Higher scores rank first. Zero means no match. */
export function scoreItem(item: SearchItem, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 1

  const title = item.title.toLowerCase()

  if (title === q) return 100
  // A prefix match is the common case when someone knows the name.
  if (title.startsWith(q)) return 80
  if (title.includes(q)) return 60

  if (item.subtitle?.toLowerCase().includes(q)) return 30
  if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return 20

  return scoreWords(item, q, title)
}

/** Multi-word queries, where the order of the words should not matter. */
function scoreWords(item: SearchItem, query: string, title: string): number {
  const words = query.split(/\s+/).filter(Boolean)
  if (words.length < 2) return 0

  if (words.every((word) => title.includes(word))) return 50
  // Last resort: every word appears somewhere on the item.
  if (words.every((word) => haystack(item).includes(word))) return 10
  return 0
}

export function rankItems(
  items: readonly SearchItem[],
  query: string,
  limit = 40,
): SearchItem[] {
  const scored = items
    .map((item) => ({ item, score: scoreItem(item, query) }))
    .filter((entry) => entry.score > 0)

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const byGroup =
      SEARCH_GROUPS.indexOf(a.item.group) - SEARCH_GROUPS.indexOf(b.item.group)
    if (byGroup !== 0) return byGroup
    return a.item.title.localeCompare(b.item.title)
  })

  return scored.slice(0, limit).map((entry) => entry.item)
}

/** Groups results for display, preserving the group order. */
export function groupItems(
  items: readonly SearchItem[],
): Array<{ group: string; items: SearchItem[] }> {
  const byGroup = new Map<string, SearchItem[]>()
  for (const item of items) {
    const bucket = byGroup.get(item.group)
    if (bucket) bucket.push(item)
    else byGroup.set(item.group, [item])
  }
  return SEARCH_GROUPS.filter((group) => byGroup.has(group)).map((group) => ({
    group,
    items: byGroup.get(group) ?? [],
  }))
}

/**
 * Results in render order, flattened.
 *
 * The palette's keyboard cursor must walk the order things are *drawn* in, not
 * the order they were ranked in — otherwise arrowing down jumps around the list.
 */
export function orderedItems(items: readonly SearchItem[]): SearchItem[] {
  return groupItems(items).flatMap((group) => group.items)
}
