import type { Group } from 'three'

/**
 * Guarantees the orientation gizmo never appears in an exported frame.
 *
 * Mirrors `features/lighting/gizmo/gizmoCaptureGuard.ts` — same problem (the
 * canvas is a continuous render loop, so gating on React state is not
 * synchronous enough to guarantee a gizmo-free frame during `capturePng`'s
 * `toBlob` wait or `recordWebm`'s whole recording window) and the same fix:
 * publish the live `Group` here and let capture code flip its `visible` flag
 * directly, synchronously, for the exact duration of the capture.
 *
 * This lives in `features/capture` rather than beside the gizmo in
 * `features/scene/gizmo` (where the light-gizmo guard lives relative to
 * `features/lighting`) for one reason: `features/scene`'s barrel re-exports
 * `SceneCanvas`, which mounts `Stage`, which mounts `CaptureBridge` from this
 * very feature — so `png.ts`/`webm.ts` importing a guard back out of
 * `@/features/scene` would be a real circular module dependency. Publishing
 * from here instead means the gizmo (in `features/scene`) depends on
 * `features/capture` — an edge that already exists via `CaptureBridge` — and
 * `png.ts`/`webm.ts` only ever need a same-feature sibling import.
 */
let group: Group | null = null

export function registerAxisGizmoGroup(next: Group | null): void {
  group = next
}

/** Hides the gizmo and returns a function that restores its prior visibility. */
export function hideAxisGizmoForCapture(): () => void {
  if (!group) return () => {}
  const target = group
  const wasVisible = target.visible
  target.visible = false
  return () => {
    target.visible = wasVisible
  }
}
