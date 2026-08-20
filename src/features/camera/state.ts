/**
 * The pure half of the camera feature: schema, presets and maths, no React.
 *
 * See `features/devices/state.ts` for why this split exists — importing the
 * camera barrel from a store slice drags `CameraRig`, and with it three.js,
 * into every page in the app.
 */
export { dolly, orbitDistance } from './navigate'
export { setSpacePanDrag, wasSpacePanDrag } from './spacePan'
export {
  CAMERA_PRESETS,
  applyCameraPreset,
  findCameraPreset,
  type CameraPreset,
} from './presets'
export {
  CAMERA_MODES,
  cameraSchema,
  defaultCamera,
  type CameraConfig,
  type CameraMode,
} from './schema'
