import { surfaceTextureControls } from './surfaceTextureControls'

/** Procedural texture for the pedestal. Split out of `sceneBackdropControls`
 *  so neither file runs into the 150-line cap. */
export const pedestalTextureControls = surfaceTextureControls({
  read: (s) => s.scene.pedestal.texture,
  write: (d) => d.scene.pedestal.texture,
  disabled: (s) => !s.scene.pedestal.enabled,
})
