/**
 * Marks async work so the app can show it is doing something.
 *
 * A single helper rather than each call site remembering to pair begin/end:
 * `finally` guarantees the counter comes back down even when the work throws,
 * and a leaked increment would leave the loading bar running forever.
 */
export async function withBusy<T>(
  begin: () => void,
  end: () => void,
  work: () => Promise<T>,
): Promise<T> {
  begin()
  try {
    return await work()
  } finally {
    end()
  }
}
