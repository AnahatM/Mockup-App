import type { Draft } from 'immer'
import {
  activeDeviceSpec,
  frameDevice,
  pedestalRadiusFor,
  shadowFarFor,
  shadowScaleFor,
} from '@/features/devices/state'
import { applyCameraPreset, findCameraPreset } from '@/features/camera/presets'
import type { AppState } from '@/state/types'
import { defaultSceneState, type SceneState } from './manifest'
import { applyScene } from './sceneState'

/**
 * Applies a built-in preset as a *look*, keeping the device you are on.
 *
 * A saved preset is the whole scene and restoring it wholesale is exactly
 * right — the user saved it that way. A built-in is not that. It is a look, and
 * every one of them is built from `defaultSceneState()`, which carries the
 * default phone. So picking a MacBook and clicking "Hex field" to try a
 * backdrop silently turned the MacBook into a phone, along with the framing,
 * the plinth and the shadow that had been sized for it.
 *
 * Finishes, textures and levitation still come from the preset: those are what
 * the device *looks like*, which is the preset's business. What it does not get
 * to decide is which device you are mocking up.
 */
export function applyLook(draft: Draft<AppState>, look: SceneState): void {
  const chosen = {
    specId: draft.device.specId,
    colorway: draft.device.colorway,
    bodyColor: draft.device.bodyColor,
    frameColor: draft.device.frameColor,
    glb: draft.device.glb,
  }

  applyScene(draft, look)

  /*
   * A preset that names a device means it: the window looks need a
   * desktop-class body to put chrome on, and `builtin.test.ts` enforces that.
   * Anything still sitting on the default is a look that never had an opinion,
   * so the user's choice wins.
   *
   * This cannot distinguish "wanted the default phone" from "said nothing",
   * and that is fine — a look that genuinely needs the default phone would be
   * a look that has an opinion about the device, which is the case above.
   */
  if (look.device.specId === defaultSceneState().device.specId) {
    Object.assign(draft.device, chosen)
  }

  reframe(draft)
}

/**
 * Re-derives everything the preset stated in units of the wrong device.
 *
 * A camera position, a plinth radius and a shadow extent are all functions of
 * how big the product is, and the preset's copies were computed for whatever
 * device it was authored against. Carrying them over unchanged frames a monitor
 * like a phone. `selectDevice` does the same three things for the same reason.
 */
function reframe(draft: Draft<AppState>): void {
  const spec = activeDeviceSpec(draft.device)

  const preset = findCameraPreset(draft.camera.preset)
  const framing = preset
    ? applyCameraPreset(preset, spec)
    : frameDevice(spec, draft.camera.fov)

  draft.camera.target = framing.target
  draft.camera.position = framing.position
  if ('fov' in framing) draft.camera.fov = framing.fov

  draft.scene.pedestal.radius = pedestalRadiusFor(spec)
  draft.scene.shadow.scale = shadowScaleFor(spec)
  draft.scene.shadow.far = shadowFarFor(spec)
}
