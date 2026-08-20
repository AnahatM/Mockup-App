/**
 * The pure half of the lighting feature: schema, rigs and defaults, no React.
 *
 * See `features/devices/state.ts`. The lighting barrel exports `LightRig` and
 * the gizmo layer, both react-three-fiber components, so importing it from a
 * store slice puts three.js into every page that touches the store.
 */
export { defaultLighting } from './defaults'
export {
  LIGHTING_PRESETS,
  applyLightingPreset,
  findLightingPreset,
  type LightingPreset,
} from './presets'
export {
  lightingSchema,
  roomSchema,
  type LightConfig,
  type LightForm,
  type LightingConfig,
  type RoomConfig,
} from './schema'
