import { describe, expect, it } from 'vitest'
import { withBusy } from './busy'

/** A stand-in for the store's busyCount, with the same never-below-zero rule. */
function counter() {
  let value = 0
  let peak = 0
  return {
    begin: () => {
      value += 1
      peak = Math.max(peak, value)
    },
    end: () => {
      value = Math.max(0, value - 1)
    },
    get value() {
      return value
    },
    get peak() {
      return peak
    },
  }
}

describe('withBusy', () => {
  it('raises the count while the work runs and lowers it after', async () => {
    const c = counter()
    const result = await withBusy(c.begin, c.end, async () => {
      expect(c.value).toBe(1)
      return 'done'
    })
    expect(result).toBe('done')
    expect(c.value).toBe(0)
  })

  it('lowers the count even when the work throws', async () => {
    const c = counter()
    await expect(
      withBusy(c.begin, c.end, () => Promise.reject(new Error('boom'))),
    ).rejects.toThrow('boom')
    // The whole point: a leaked increment leaves the bar running forever.
    expect(c.value).toBe(0)
  })

  it('rethrows rather than swallowing the error', async () => {
    const c = counter()
    const error = new Error('specific')
    await expect(withBusy(c.begin, c.end, () => Promise.reject(error))).rejects.toBe(
      error,
    )
  })

  it('counts concurrent work, so the first to finish does not clear the bar', async () => {
    const c = counter()
    let releaseSlow = () => {}
    const slow = new Promise<void>((resolve) => {
      releaseSlow = resolve
    })

    const a = withBusy(c.begin, c.end, () => slow)
    const b = withBusy(c.begin, c.end, () => Promise.resolve())
    await b

    expect(c.value).toBe(1)
    expect(c.peak).toBe(2)

    releaseSlow()
    await a
    expect(c.value).toBe(0)
  })
})
