import { surfaceTextureControls } from './surfaceTextureControls'

/** Procedural texture for the device's back/body surface. */
export const bodyTextureControls = surfaceTextureControls({
  read: (s) => s.device.bodyTexture,
  write: (d) => d.device.bodyTexture,
})

/** Procedural texture for the device's frame/rail surface. */
export const frameTextureControls = surfaceTextureControls({
  read: (s) => s.device.frameTexture,
  write: (d) => d.device.frameTexture,
})
