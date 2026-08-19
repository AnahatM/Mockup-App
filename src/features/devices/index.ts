export { Device } from './components/Device'
export { DeviceRail } from './components/DeviceRail'
export { ColorwayPicker } from './components/ColorwayPicker'
export { deviceConfigSchema, type DeviceConfig } from './schema'
export { configForDevice, defaultDeviceConfig } from './spec/defaults'
export {
  frameDevice,
  groundOffsetMm,
  pedestalRadiusFor,
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
