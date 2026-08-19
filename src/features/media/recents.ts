/**
 * Pure list logic for "recent uploads" — capping, dedupe, eviction, and
 * reordering. Kept free of DOM/React/Zustand so it can be unit tested directly
 * and reasoned about without a browser.
 *
 * Persistence decision: recents are session-only, by design. Each entry holds
 * a real object URL (`URL.createObjectURL`), and an object URL is meaningless
 * after a reload — the blob it points at lived only in this tab's memory.
 * Persisting recents across reloads would mean copying every file's bytes into
 * localStorage or IndexedDB: unbounded for a screen recording (tens of MB),
 * and blowing the ~5MB localStorage quota after a screenshot or two (see
 * `features/presets/storage.ts`, which strips media for exactly this reason).
 * Since the ask is "switch between the last few *this session*", an in-memory
 * list is simpler, always available, and has no persistence step that can
 * fail — there is no quota error to handle gracefully because there is no
 * write to storage at all.
 */

export const RECENTS_CAP = 5

/**
 * One remembered upload. `url` is the original object URL; ownership of
 * revoking it belongs to whoever holds the list (see `state/slices/media.ts`)
 * — never revoke a URL found on an entry still in the list. `thumbnail` is a
 * small, self-contained data URL so the row never re-decodes or re-draws the
 * full-size media just to show a 40px preview.
 */
export interface RecentUpload {
  id: string
  kind: 'image' | 'video'
  name: string
  url: string
  thumbnail: string
  width: number
  height: number
  palette: string[]
}

/**
 * Stable dedupe key for a File: re-uploading the same file (same name, size
 * and modified time) should move it to the front, not add a duplicate entry.
 */
export function recentIdFor(file: Pick<File, 'name' | 'size' | 'lastModified'>): string {
  return `${file.name}::${file.size}::${file.lastModified}`
}

export interface UpsertResult {
  next: RecentUpload[]
  /** Entries no longer in the list — the caller must revoke their URLs. */
  evicted: RecentUpload[]
}

/**
 * Adds `entry` to the front of `list`, removing any existing entry with the
 * same id (dedupe / move-to-front) and trimming to `cap` (oldest-first
 * eviction). Pure: does not touch the URLs it evicts, so the caller can
 * revoke each exactly once.
 */
export function upsertRecent(
  list: readonly RecentUpload[],
  entry: RecentUpload,
  cap: number = RECENTS_CAP,
): UpsertResult {
  const dupe = list.find((existing) => existing.id === entry.id)
  const withoutDupe = list.filter((existing) => existing.id !== entry.id)
  const combined = [entry, ...withoutDupe]
  const next = combined.slice(0, cap)
  const overflow = combined.slice(cap)
  return { next, evicted: dupe ? [dupe, ...overflow] : overflow }
}

/**
 * Moves an existing entry to the front, e.g. when the user clicks a thumbnail
 * to switch back to it. Returns an equivalent copy (no-op) if the id is
 * missing or already at the front.
 */
export function moveToFront(list: readonly RecentUpload[], id: string): RecentUpload[] {
  const index = list.findIndex((entry) => entry.id === id)
  if (index <= 0) return [...list]
  const entry = list[index]
  if (!entry) return [...list]
  return [entry, ...list.slice(0, index), ...list.slice(index + 1)]
}
