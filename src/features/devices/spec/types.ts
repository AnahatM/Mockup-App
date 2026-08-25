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
  /** Bezel width, on the sides and — unless `insetTop` says otherwise — the top. */
  inset: number
  /**
   * Top bezel, when it differs from the sides.
   *
   * Laptops and all-in-ones carry a camera up there, so their top bezel is
   * roughly twice the side. Without a third number the geometry could not be
   * made to agree with the published display aspect at any inset: forcing the
   * top to match the sides pushed the whole error into the chin.
   */
  insetTop?: number
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
/**
 * A hole in a rail: a charging port, a microphone, a speaker grille.
 *
 * The detail that most separates a phone from a rounded rectangle, and the one
 * a viewer never consciously notices — a bottom edge with nothing on it reads
 * as "unfinished" without anyone being able to say why. Modelled as data
 * because that is the rule here: a new detail is a spec field, not a new mesh.
 */
export interface EdgeCutoutSpec {
  side: 'bottom' | 'top' | 'left' | 'right'
  /** Centre offset along the rail, from the body's centre. */
  offset: number
  /** Along the rail. */
  length: number
  /** Across the rail. Defaults to a proportion of the body's depth. */
  across?: number
  /**
   * `slot` is a port, `hole` a single microphone, `grille` a row of holes —
   * `count` of them, spread across `length`.
   */
  kind: 'slot' | 'hole' | 'grille'
  count?: number
}

/** Rubber pads under a laptop's base. Four of them, inset from the corners. */
export interface FeetSpec {
  width: number
  depth: number
  height: number
  /** How far in from each corner the pads sit. */
  inset: number
}

/**
 * The fold line down a foldable's inner screen.
 *
 * A folding phone without one does not read as folding — it reads as a wide
 * phone. It is a shading feature rather than a hole, so it is drawn as a soft
 * band across the glass rather than cut into it.
 */
export interface CreaseSpec {
  /** `x` folds left-to-right (a book fold), `y` top-to-bottom (a flip). */
  axis: 'x' | 'y'
  /** How wide the softened band is, in millimetres. */
  width: number
}

/** The magnet ring under a phone's back glass. Visible as a faint disc. */
export interface MagSafeSpec {
  radius: number
  /** Ring thickness. */
  band: number
  /** Distance below the camera bump's centre. */
  y: number
}

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
  /** Pads under the base. Without them a laptop sits flush on the desk, which
   *  is the one thing no laptop does. */
  feet?: FeetSpec
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
  /**
   * How far the fastened loop bulges behind the case — its depth semi-axis.
   *
   * There is deliberately no `length`. The strap used to be swept a fixed
   * distance along an open curve, which is why it read as a ribbon floating
   * past the case; now both halves are arcs of one ellipse solved from this
   * and the case height, so a length would be a second, contradictory way to
   * say where the strap ends. See `spec/bandLoop.ts`.
   */
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
  /** Ports, microphones and speaker grilles cut into the rails. */
  edges?: readonly EdgeCutoutSpec[]
  /** Fold line, for foldables. */
  crease?: CreaseSpec
  /** Magnet ring under the back glass. */
  magsafe?: MagSafeSpec
  hinge?: HingeSpec
  stand?: StandSpec
  band?: BandSpec
  /** Screen aspect, used to letterbox uploaded media sensibly. */
  screenAspect?: number
}
