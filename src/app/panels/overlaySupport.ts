import { resolveDevice, type OverlayKind } from '@/features/devices'
import { overlayApplies } from '@/features/screen'
import type { AppState } from '@/state/types'

/**
 * Overlay controls are gated on `spec.supportedOverlays`, so a phone is never
 * offered a macOS dock and a laptop is never offered a gesture bar.
 */
export const supports =
  (...kinds: OverlayKind[]) =>
  (state: AppState) =>
    overlayApplies(resolveDevice(state.device.specId).supportedOverlays, kinds)
