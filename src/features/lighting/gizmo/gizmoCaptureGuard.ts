import type { Group } from 'three'

/**
 * Guarantees gizmos never appear in an exported frame.
 *
 * Gizmos are an editing aid, so they must be invisible to `capturePng` and
 * `recordWebm`. Those live outside React (see `features/capture/handle.ts`)
 * and read the canvas synchronously or over a real-time recording window, so
 * gating on React state (a store flag another render cycle reacts to) is not
 * safe — the render loop is continuous (`Canvas` uses the default
 * `frameloop="always"`), so a frame can be drawn between a state update and
 * React actually committing it, and that frame could still show gizmos.
 *
 * Instead the live `Group` holding every gizmo is published here, mirroring
 * the existing `CaptureHandle` pattern, and capture code flips its `visible`
 * flag directly — a synchronous mutation the very next render call is
 * guaranteed to see, with no React round trip in between.
 */
let group: Group | null = null

export function registerGizmoGroup(next: Group | null): void {
  group = next
}

/** Hides gizmos and returns a function that restores their prior visibility. */
export function hideGizmosForCapture(): () => void {
  if (!group) return () => {}
  const target = group
  const wasVisible = target.visible
  target.visible = false
  return () => {
    target.visible = wasVisible
  }
}
