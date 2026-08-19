/**
 * An undo/redo stack.
 *
 * Pure and generic: it holds whatever snapshot type it is given and knows
 * nothing about scenes, so it is testable without a store and reusable for
 * anything else that needs history.
 *
 * Snapshots rather than inverse operations. The scene is a few kilobytes of
 * plain data with structural sharing from immer, so a snapshot is cheap — and
 * every control in the app would otherwise need to define and maintain its own
 * inverse, which is a large surface for a subtle bug.
 */

/**
 * Note the arrays are not marked `readonly`.
 *
 * This structure is stored inside an immer-backed store, and immer cannot write
 * a readonly array into a draft. Immutability is guaranteed by these functions
 * never mutating their input — which is asserted by a test — rather than by the
 * type, which would otherwise have to be cast away at every call site.
 */
export interface History<T> {
  /** Oldest first. The last entry is the current state. */
  past: T[]
  /** Newest first — the next redo is at index 0. */
  future: T[]
}

/** How many steps back the user can go. */
export const HISTORY_LIMIT = 50

export const emptyHistory = <T,>(initial: T): History<T> => ({
  past: [initial],
  future: [],
})

export const canUndo = <T,>(history: History<T>): boolean => history.past.length > 1
export const canRedo = <T,>(history: History<T>): boolean => history.future.length > 0

export const current = <T,>(history: History<T>): T | undefined =>
  history.past[history.past.length - 1]

/**
 * Records a new state.
 *
 * Pushing always clears the redo stack: once you change something after undoing,
 * the branch you undid is no longer reachable, and offering a redo that would
 * jump to an unrelated state is worse than offering none.
 */
export function push<T>(history: History<T>, snapshot: T): History<T> {
  const past = [...history.past, snapshot]
  return {
    past: past.length > HISTORY_LIMIT ? past.slice(past.length - HISTORY_LIMIT) : past,
    future: [],
  }
}

export function undo<T>(history: History<T>): History<T> {
  if (!canUndo(history)) return history
  const undone = history.past[history.past.length - 1]
  return {
    past: history.past.slice(0, -1),
    // `undone` is defined whenever canUndo holds, but the compiler cannot see
    // that through an index access, and a non-null assertion is banned here.
    future: undone === undefined ? history.future : [undone, ...history.future],
  }
}

export function redo<T>(history: History<T>): History<T> {
  const next = history.future[0]
  if (next === undefined) return history
  return {
    past: [...history.past, next],
    future: history.future.slice(1),
  }
}
