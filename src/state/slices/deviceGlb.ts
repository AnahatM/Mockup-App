import {
  buildImportedDeviceSpec,
  frameDevice,
  IMPORTED_DEVICE_ID,
  pedestalRadiusFor,
  shadowScaleFor,
  type DeviceConfig,
} from '@/features/devices/state'
import type { SliceCreator } from '../types'

/** The import-only slice of `DeviceSlice`, split into its own module purely
 *  to keep `device.ts` under this repo's per-file line limit. */
export interface DeviceGlbSlice {
  /** Import failures (bad file, no meshes, huge model) — surfaced next to the
   *  import control, never thrown into the canvas. */
  glbError: string | null
  /** Starts an import. Mesh names and bounds arrive later, once the model
   *  has actually loaded — see `setGlbMeshes`/`setGlbBounds`. */
  importGlbModel: (url: string, name: string) => void
  setGlbMeshes: (meshNames: string[], suggested: string | null) => void
  setGlbScreenMesh: (meshName: string) => void
  setGlbBounds: (sizeMm: readonly [number, number, number]) => void
  setGlbError: (message: string | null) => void
  clearGlbModel: () => void
}

/** Revokes the object URL behind the current import, if any, so switching or
 *  clearing models never leaks blob URLs. */
export function revokeGlb(glb: DeviceConfig['glb']): void {
  if (glb) URL.revokeObjectURL(glb.url)
}

/** The `set` signature is independent of which slice's factory it came from
 *  — only the return type of a `SliceCreator` varies — so this is extracted
 *  without depending on `DeviceSlice` and risking an import cycle with it. */
type SetDeviceState = Parameters<SliceCreator<unknown>>[0]

export function createGlbActions(
  set: SetDeviceState,
): Omit<DeviceGlbSlice, 'glbError'> {
  return {
    importGlbModel: (url, name) =>
      set((draft) => {
        revokeGlb(draft.device.glb)
        draft.device.specId = IMPORTED_DEVICE_ID
        draft.device.glb = { url, name, screenMesh: null, meshNames: [], sizeMm: null }
        draft.glbError = null
      }),

    setGlbMeshes: (meshNames, suggested) =>
      set((draft) => {
        const glb = draft.device.glb
        if (!glb) return
        glb.meshNames = meshNames
        if (!glb.screenMesh || !meshNames.includes(glb.screenMesh)) {
          glb.screenMesh = suggested
        }
      }),

    setGlbScreenMesh: (meshName) =>
      set((draft) => {
        if (draft.device.glb) draft.device.glb.screenMesh = meshName
      }),

    /** Re-frames the camera and pedestal from the model's real bounds, exactly
     *  as `selectDevice` does for a catalogue pick. */
    setGlbBounds: (sizeMm) =>
      set((draft) => {
        const glb = draft.device.glb
        if (!glb) return
        glb.sizeMm = [...sizeMm]
        const spec = buildImportedDeviceSpec({
          url: glb.url,
          name: glb.name,
          screenMesh: glb.screenMesh,
          sizeMm: glb.sizeMm,
        })
        const framing = frameDevice(spec, draft.camera.fov)
        draft.camera.target = framing.target
        draft.camera.position = framing.position
        draft.camera.preset = 'auto'
        draft.scene.pedestal.radius = pedestalRadiusFor(spec)
        draft.scene.shadow.scale = shadowScaleFor(spec)
      }),

    setGlbError: (message) =>
      set((draft) => {
        draft.glbError = message
      }),

    clearGlbModel: () =>
      set((draft) => {
        revokeGlb(draft.device.glb)
        draft.device.glb = null
        draft.glbError = null
      }),
  }
}
