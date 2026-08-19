/**
 * Short, collision-resistant ids for user-created entities (lights, presets).
 *
 * Uses `crypto.randomUUID` where available and falls back to a random string, so
 * this works in insecure contexts and in tests without pulling in a dependency.
 */
export function createId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${random}`
}
