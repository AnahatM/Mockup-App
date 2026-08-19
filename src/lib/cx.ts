/**
 * Joins conditional class names. A three-line local helper instead of a
 * dependency, because this is the only thing we would use one for.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
