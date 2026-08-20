export { composeWindow, WINDOW_ASPECT, type ComposeOptions } from './compose'
export { exportFlatWindow } from './exportFlat'
export { FlatPreview, type FlatPreviewProps } from './FlatPreview'
export { FlatStudio } from './FlatStudio'
export { useFlatExport, type FlatExport } from './useFlatExport'
export { resolveChrome, type ResolvedChrome } from './resolveChrome'
export {
  defaultFlat,
  flatSchema,
  BORDER_SHAPES,
  CONTAINER_STYLES,
  SHADOW_STYLES,
  TITLE_ALIGNMENTS,
  WINDOW_STYLES,
  type BorderShape,
  type ContainerStyle,
  type FlatConfig,
  type ShadowStyle,
  type TitleAlignment,
  type WindowStyle,
} from './schema'
export { BORDER_SHAPE_RADII, seedRadius } from './borderShapes'
export { CONTAINER_LOOKS, resolveContainerLook, type ContainerLook } from './containerLooks'
export { resolveShadowLook, shadowColor, type ShadowLook } from './shadowLooks'
