/**
 * Which mesh name most plausibly is the screen, so an import gets a sensible
 * default before the user has looked at anything. Never authoritative — the
 * mesh picker always lets the user override it — just a reasonable first guess.
 *
 * Ordered by specificity: an exact "screen" match should win over a mesh that
 * merely contains "display" somewhere in a longer name.
 */
const SCREEN_KEYWORDS: readonly string[] = ['screen', 'display', 'lcd', 'panel', 'glass']

export function pickDefaultScreenMesh(names: readonly string[]): string | null {
  const exact = names.find((name) => SCREEN_KEYWORDS.includes(lower(name)))
  if (exact) return exact

  for (const keyword of SCREEN_KEYWORDS) {
    const match = names.find((name) => lower(name).includes(keyword))
    if (match) return match
  }

  return null
}

function lower(name: string): string {
  return name.trim().toLowerCase()
}
