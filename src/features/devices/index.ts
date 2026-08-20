export { Device } from './components/Device'
export { DeviceRail } from './components/DeviceRail'
export { ColorwayPicker } from './components/ColorwayPicker'
export { PaintPicker } from './components/PaintPicker'
export { GlbImportPicker } from './components/GlbImportPicker'
export { MeshPicker } from './components/MeshPicker'
export { deviceFinishPalette } from './finishPalette'
export { PAINT_COLORS, railColorFor, type PaintColor } from './paint'
export {
  buildImportedDeviceSpec,
  IMPORTED_DEVICE_ID,
  type ImportedGlbSource,
} from './glb/spec'
export {
  FINISHES,
  FINISH_KINDS,
  FINISH_LABELS,
  SCREEN_FINISHES,
  SCREEN_FINISH_LABELS,
  type ScreenFinish,
} from './materials/finishes'
export { deviceConfigSchema, type DeviceConfig, type GlbSource } from './schema'
export { configForDevice, defaultDeviceConfig } from './spec/defaults'
export {
  frameDevice,
  groundOffsetMm,
  pedestalRadiusFor,
  shadowFarFor,
  shadowScaleFor,
  type DeviceFraming,
} from './spec/framing'
export {
  DEVICES,
  devicesByCategory,
  findColorway,
  findDevice,
  resolveDevice,
} from './spec/registry'
export {
  MM_TO_UNITS,
  type Colorway,
  type DeviceKind,
  type DeviceSpec,
  type OverlayKind,
} from './spec/types'
