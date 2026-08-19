/**
 * A tiny Result type for operations that fail in ways the user should see.
 *
 * Used where a thrown exception would be wrong: decoding an uploaded file,
 * parsing an imported preset. Those failures are expected outcomes with a
 * message to show, not crashes.
 */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok
}

/** Returns the value, or a fallback if the result failed. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.ok ? result.value : fallback
}
