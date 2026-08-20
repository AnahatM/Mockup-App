import type { MediaSource } from '@/features/media'
import { useAppStore } from '@/state/store'
import type { AppState } from '@/state/types'

/** Everything a showcase capture temporarily overrides, so it can be restored
 * exactly once the composite is built — including if capture throws partway. */
export interface CaptureStateSnapshot {
  backdropMode: AppState['scene']['backdrop']['mode']
  pedestalEnabled: boolean
  shadowEnabled: boolean
  vignetteEnabled: boolean
  mediaSource: MediaSource
}

export function snapshotCaptureState(state: AppState): CaptureStateSnapshot {
  return {
    backdropMode: state.scene.backdrop.mode,
    pedestalEnabled: state.scene.pedestal.enabled,
    shadowEnabled: state.scene.shadow.enabled,
    vignetteEnabled: state.scene.post.vignetteEnabled,
    mediaSource: state.media.source,
  }
}

/**
 * Isolates the device for a per-slot capture: no backdrop, pedestal, ground
 * shadow or vignette, so several transparent captures can be layered onto one
 * shared showcase background without every device dragging its own studio
 * along with it. Every field mutated here already exists for the ordinary
 * single-device export (`backdrop.mode: 'transparent'` is exactly what
 * powers today's transparent PNG export) — this only combines them.
 */
export function isolateDeviceForCapture(): void {
  useAppStore.setState((draft) => {
    draft.scene.backdrop.mode = 'transparent'
    draft.scene.pedestal.enabled = false
    draft.scene.shadow.enabled = false
    draft.scene.post.vignetteEnabled = false
  })
}

/** Swaps the live screen texture, e.g. to show a slot's own screenshot. */
export function setCaptureMediaSource(source: MediaSource): void {
  useAppStore.setState((draft) => {
    draft.media.source = source
  })
}

export function restoreCaptureState(snapshot: CaptureStateSnapshot): void {
  useAppStore.setState((draft) => {
    draft.scene.backdrop.mode = snapshot.backdropMode
    draft.scene.pedestal.enabled = snapshot.pedestalEnabled
    draft.scene.shadow.enabled = snapshot.shadowEnabled
    draft.scene.post.vignetteEnabled = snapshot.vignetteEnabled
    draft.media.source = snapshot.mediaSource
  })
}
