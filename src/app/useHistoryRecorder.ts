import { useEffect } from 'react'
import { captureScene, sameScene } from '@/features/presets'
import { useAppStore } from '@/state/store'

/**
 * How long the scene must sit still before a snapshot is taken.
 *
 * Coalescing matters more than it might seem: dragging one slider fires an
 * update per pointer move, so without this a single drag would fill the entire
 * undo stack and "undo" would step back one pixel at a time. Waiting for the
 * gesture to finish makes one drag one undo step, which is what a user means.
 */
const QUIET_MS = 450

/**
 * Records scene changes into the undo stack.
 *
 * Watches the store rather than asking every action to record itself. Controls
 * in this app are declared as data with generic `update` accessors, so there is
 * no single place an action passes through — and a rule that every new control
 * must remember to call `recordHistory` is a rule that will be forgotten.
 */
export function useHistoryRecorder(): void {
  useEffect(() => {
    let timer: number | undefined

    const unsubscribe = useAppStore.subscribe((state, previous) => {
      // Applying an undo must not itself be recorded, or undo could never
      // escape the state it just restored.
      if (state.applyingHistory) return
      if (sameScene(captureScene(state), captureScene(previous))) return

      window.clearTimeout(timer)
      timer = window.setTimeout(() => useAppStore.getState().recordHistory(), QUIET_MS)
    })

    return () => {
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [])
}
