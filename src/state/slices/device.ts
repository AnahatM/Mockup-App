import {
  configForDevice,
  defaultDeviceConfig,
  findColorway,
  frameDevice,
  pedestalRadiusFor,
  railColorFor,
  shadowScaleFor,
  resolveDevice,
  type DeviceConfig,
} from '@/features/devices'
import type { SliceCreator } from '../types'
import { createGlbActions, revokeGlb, type DeviceGlbSlice } from './deviceGlb'

export interface DeviceSlice extends DeviceGlbSlice {
  device: DeviceConfig
  selectDevice: (specId: string) => void
  selectColorway: (colorwayId: string) => void
  /** Paints the body any colour, deriving a matching rail. */
  paintDevice: (hex: string) => void
  resetDevice: () => void
}

export const createDeviceSlice: SliceCreator<DeviceSlice> = (set) => ({
  device: defaultDeviceConfig(),
  glbError: null,

  /**
   * Switching device re-seeds its colours and re-frames the camera, but keeps
   * the user's detail toggles. A laptop is twice the size of a phone, so reusing
   * one fixed camera would crop one and lose the other. Also drops any active
   * import — a catalogue pick and an import are mutually exclusive.
   */
  selectDevice: (specId) =>
    set((draft) => {
      revokeGlb(draft.device.glb)
      const spec = resolveDevice(specId)
      Object.assign(draft.device, configForDevice(spec))
      draft.device.glb = null
      draft.glbError = null
      const framing = frameDevice(spec, draft.camera.fov)
      draft.camera.target = framing.target
      draft.camera.position = framing.position
      draft.camera.preset = 'auto'
      draft.scene.pedestal.radius = pedestalRadiusFor(spec)
      draft.scene.shadow.scale = shadowScaleFor(spec)
    }),

  selectColorway: (colorwayId) =>
    set((draft) => {
      const colorway = findColorway(resolveDevice(draft.device.specId), colorwayId)
      if (!colorway) return
      draft.device.colorway = colorwayId
      draft.device.bodyColor = colorway.body
      draft.device.frameColor = colorway.frame ?? colorway.body
    }),

  paintDevice: (hex) =>
    set((draft) => {
      draft.device.bodyColor = hex
      draft.device.frameColor = railColorFor(hex)
      draft.device.colorway = 'custom'
    }),

  resetDevice: () =>
    set((draft) => {
      revokeGlb(draft.device.glb)
      draft.device = defaultDeviceConfig()
      draft.glbError = null
    }),

  ...createGlbActions(set),
})
