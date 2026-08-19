import type { Camera, Scene, WebGLRenderer } from 'three'

/**
 * Handle onto the live renderer, published for code outside the Canvas.
 *
 * Export is triggered from the inspector, which lives in the DOM tree rather
 * than the R3F tree, so it cannot call `useThree`. Rather than lifting the
 * renderer into React state — which would re-render the scene whenever it
 * changed — a single mutable handle is published from inside the Canvas and read
 * imperatively at the moment the user actually exports.
 *
 * Kept in its own module so `CaptureBridge.tsx` exports only a component and
 * stays inside react-refresh's fast-refresh boundary.
 */
export interface CaptureHandle {
  renderer: WebGLRenderer
  scene: Scene
  camera: Camera
  /** Renders one frame through whatever pipeline is active. */
  render: () => void
}

let handle: CaptureHandle | null = null

export function getCaptureHandle(): CaptureHandle | null {
  return handle
}

export function setCaptureHandle(next: CaptureHandle | null): void {
  handle = next
}
