import { useCallback } from 'react'
import { withBusy } from '@/lib/busy'
import { useAppStore } from './store'

/**
 * Runs async work with the site-wide loading bar showing.
 *
 * A hook rather than each call site pulling `beginBusy`/`endBusy` out of the
 * store and pairing them by hand: the pairing is the part that goes wrong, and
 * a leaked increment leaves the bar running forever.
 */
export function useBusy(): <T>(work: () => Promise<T>) => Promise<T> {
  const begin = useAppStore((state) => state.beginBusy)
  const end = useAppStore((state) => state.endBusy)

  return useCallback(
    <T,>(work: () => Promise<T>) => withBusy(begin, end, work),
    [begin, end],
  )
}
