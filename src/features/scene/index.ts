export { SceneCanvas } from './SceneCanvas'
export { AdaptiveBackdrops } from './backdrop/AdaptiveBackdrops'
export { deriveBackdrops, type AdaptiveBackdrop } from './backdrop/adaptive'
export { hasWebGL } from './hasWebGL'
export { AxisGizmo } from './gizmo/AxisGizmo'
export {
  sceneSchema,
  defaultScene,
  BACKDROP_MODES,
  PEDESTAL_SHAPES,
  type BackdropConfig,
  type BackdropMode,
  type PedestalConfig,
  type PedestalShape,
  type PostConfig,
  type SceneConfig,
  type ShadowConfig,
} from './schema'
export {
  Structures,
  LATTICE_KINDS,
  STRUCTURE_KINDS,
  STRUCTURE_LABELS,
  defaultStructure,
  structureSchema,
  type StructureConfig,
  type StructureKind,
} from './environments'
