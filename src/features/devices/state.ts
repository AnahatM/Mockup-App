/**
 * The pure half of the devices feature: data, specs and maths, no React.
 *
 * The store needs `resolveDevice` and `frameDevice`; it does not need `<Device>`.
 * But importing them through `index.ts` — which also exports react-three-fiber
 * components — pulls three.js into anything that touches the store, which is
 * every component in the app. That is why the documentation pages were shipping
 * a megabyte of 3D engine they never use.
 *
 * Anything exported here must stay free of React and three.js *components*.
 * Plain three.js maths types are fine; a component is not.
 */
export { deviceFinishPalette } from './finishPalette'
export { IMPORTED_DEVICE_ID, buildImportedDeviceSpec } from './glb/spec'
export { PAINT_COLORS, railColorFor, type PaintColor } from './paint'
export {
  FINISHES,
  FINISH_KINDS,
  FINISH_LABELS,
  SCREEN_FINISHES,
  SCREEN_FINISH_LABELS,
  type ScreenFinish,
} from './materials/finishes'
export { deviceConfigSchema, type DeviceConfig } from './schema'
export { configForDevice, defaultDeviceConfig } from './spec/defaults'
export { frameDevice, groundOffsetMm, type DeviceFraming } from './spec/framing'
export {
  clearanceRadiusFor,
  pedestalRadiusFor,
  productHeightFor,
  shadowFarFor,
  shadowScaleFor,
} from './spec/ground'
export {
  activeDeviceSpec,
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
