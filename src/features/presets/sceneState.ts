import type { Draft } from 'immer'
import type { AppState } from '@/state/types'
import type { SceneState } from './manifest'

/**
 * Moves a whole scene between the store and a manifest.
 *
 * Deliberately explicit rather than a generic key copy: the store also holds
 * ephemeral UI state and the loaded media, and neither belongs in a saved
 * preset. Listing the sections means a new slice cannot accidentally start
 * being serialised — or accidentally be forgotten, since the manifest schema
 * would fail to typecheck.
 */
export function captureScene(state: AppState): SceneState {
  return {
    device: state.device,
    screen: state.screen,
    overlays: state.overlays,
    flat: state.flat,
    camera: state.camera,
    lighting: state.lighting,
    scene: state.scene,
    animation: state.animation,
    exportConfig: state.exportConfig,
  }
}

export function applyScene(draft: Draft<AppState>, scene: SceneState): void {
  draft.device = scene.device
  draft.screen = scene.screen
  draft.overlays = scene.overlays
  draft.flat = scene.flat
  draft.camera = scene.camera
  draft.lighting = scene.lighting
  draft.scene = scene.scene
  draft.animation = scene.animation
  draft.exportConfig = scene.exportConfig
}

/**
 * Whether two scenes are the same, by section reference.
 *
 * Immer gives structural sharing: a section that was not touched by an update
 * is the very same object afterwards. So comparing the nine sections by
 * reference is both exact and O(1) — a deep equality walk over the whole scene
 * would cost far more and tell us nothing extra.
 */
export function sameScene(a: SceneState, b: SceneState): boolean {
  return (
    a.device === b.device &&
    a.screen === b.screen &&
    a.overlays === b.overlays &&
    a.flat === b.flat &&
    a.camera === b.camera &&
    a.lighting === b.lighting &&
    a.scene === b.scene &&
    a.animation === b.animation &&
    a.exportConfig === b.exportConfig
  )
}
