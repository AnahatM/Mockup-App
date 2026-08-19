import type { IconName } from '@/ui'

/**
 * A device is DATA, not a model. See docs/reference/device-specs.md.
 *
 * All dimensions are in **millimetres**, so a spec can be written straight from
 * published measurements. The renderer converts once via `MM_TO_UNITS`.
 *
 * Specs are authored in-repo and checked by the compiler, so they are plain
 * TypeScript. User-editable device *config* (which device, what colour, which
 * details are shown) is separate and validated by Zod, because that is the part
 * that ends up in a saved preset.
 */

/** Scene units are 100mm, keeping camera and light distances in single digits. */
export const MM_TO_UNITS = 0.01

export type DeviceKind = 'phone' | 'tablet' | 'laptop' | 'desktop' | 'watch'

/** The GLB escape hatch. See docs/adr/0001-procedural-geometry.md. */
export type DeviceMeshSource =
  { kind: 'procedural' } | { kind: 'glb'; url: string; screenMesh: string }

export type FinishKind =
  | 'titanium'
  | 'aluminium'
  | 'anodised'
  | 'steel'
  | 'polished-metal'
  | 'matte-glass'
  | 'gloss-glass'
  | 'ceramic'
  | 'soft-plastic'
  | 'gloss-plastic'

export interface BodySpec {
  width: number
  height: number
  depth: number
  cornerRadius: number
  /** Superellipse exponent: 2 is a circular arc, 4-5 a continuous corner. */
  cornerSmoothing?: number
  /** Chamfer on the front and back edges — this is what catches the rim light. */
  edgeRadius: number
}

export interface ScreenSpec {
  /** Bezel width. */
  inset: number
  /** Chin, when it differs from the other three sides. */
  insetBottom?: number
  cornerRadius: number
}

export type CutoutSpec =
  | { type: 'none' }
  | { type: 'notch'; width: number; height: number }
  | { type: 'island'; width: number; height: number; top: number }
  | { type: 'punch-hole'; diameter: number; top: number; offsetX?: number }

export interface LensSpec {
  /** Offset from the camera bump centre. */
  x: number
  y: number
  radius: number
}

export interface CameraBumpSpec {
  /** Offset from the body centre, on the back face. */
  x: number
  y: number
  width: number
  height: number
  depth: number
  cornerRadius: number
  lenses: readonly LensSpec[]
  flash?: LensSpec
}

export type ButtonSide = 'left' | 'right' | 'top' | 'bottom'

export interface ButtonSpec {
  side: ButtonSide
  /** Distance from the body centre along the rail, positive = up. */
  offset: number
  length: number
  /** How far it stands proud of the rail. */
  protrusion?: number
  width?: number
}

/** Laptops and folding phones: two bodies joined by a hinge. */
export interface HingeSpec {
  /** Angle in degrees between the two halves. 180 is flat. */
  defaultAngle: number
  minAngle: number
  maxAngle: number
  /** The half that does NOT contain the screen. */
  base: BodySpec
  /** Trackpad and keyboard plate, for laptops. */
  keyboard?: { width: number; height: number; y: number }
  trackpad?: { width: number; height: number; y: number }
}

/** Desktops and monitors: a neck rising from a foot on the desk. */
export interface StandSpec {
  neckWidth: number
  neckDepth: number
  neckHeight: number
  baseWidth: number
  baseDepth: number
  baseHeight: number
  /** Backward lean of the display, in degrees. */
  tilt?: number
}

/** Watches: a strap swept along a curve away from the case. */
export interface BandSpec {
  width: number
  thickness: number
  /** Length of each half, measured along the curve. */
  length: number
  /** How far the strap curves back behind the wrist. */
  curve: number
  /** Narrowing toward the free end, 0-1. */
  taper?: number
  material?: FinishKind
}

export interface Colorway {
  id: string
  label: string
  body: string
  /** Falls back to `body` when the rails match the back. */
  frame?: string
}

export interface MaterialsSpec {
  frame: FinishKind
  back: FinishKind
}

/** Screen overlays that make sense for this device. */
export type OverlayKind =
  | 'status-bar-ios'
  | 'status-bar-android'
  | 'gesture-bar'
  | 'nav-bar-android'
  | 'menu-bar'
  | 'dock'

export interface DeviceSpec {
  id: string
  name: string
  /** Grouping label for the device rail, e.g. "Phones". */
  category: string
  kind: DeviceKind
  icon: IconName
  mesh: DeviceMeshSource
  body: BodySpec
  screen: ScreenSpec
  cutout: CutoutSpec
  buttons: readonly ButtonSpec[]
  materials: MaterialsSpec
  colorways: readonly Colorway[]
  supportedOverlays: readonly OverlayKind[]
  cameraBump?: CameraBumpSpec
  hinge?: HingeSpec
  stand?: StandSpec
  band?: BandSpec
  /** Screen aspect, used to letterbox uploaded media sensibly. */
  screenAspect?: number
}
