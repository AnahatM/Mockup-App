import { z } from 'zod'
import { hexSchema, unitSchema } from '@/lib/schema/primitives'

/**
 * 2D window chrome — the "digital mockup" side of the app.
 *
 * Drawn on a canvas rather than as DOM, which lets exactly the same code serve
 * two purposes: a flat PNG export, and a texture shown on a device's screen
 * inside the 3D scene. A DOM implementation would need a rasteriser to do the
 * first and could not do the second at all.
 */

export const WINDOW_STYLES = ['none', 'macos', 'browser'] as const
export type WindowStyle = (typeof WINDOW_STYLES)[number]

export const TITLE_ALIGNMENTS = ['left', 'center'] as const
export type TitleAlignment = (typeof TITLE_ALIGNMENTS)[number]

/**
 * Container style presets — matches shots.so's "Default / Glass / Inset /
 * Outline / Border" set. Each name resolves to a `ContainerLook` (see
 * `containerLooks.ts`); this schema only owns the string union so a saved
 * preset can validate it.
 */
export const CONTAINER_STYLES = [
  'default',
  'glass-light',
  'glass-dark',
  'inset-light',
  'inset-dark',
  'outline',
  'border',
] as const
export type ContainerStyle = (typeof CONTAINER_STYLES)[number]

/** Shape presets that seed `cornerRadius` — see `borderShapes.ts`. */
export const BORDER_SHAPES = ['sharp', 'curved', 'round'] as const
export type BorderShape = (typeof BORDER_SHAPES)[number]

/** Shadow presets that seed the drop shadow's geometry — see `shadowLooks.ts`. */
export const SHADOW_STYLES = ['none', 'spread', 'hug', 'adaptive'] as const
export type ShadowStyle = (typeof SHADOW_STYLES)[number]

export const flatSchema = z.object({
  style: z.enum(WINDOW_STYLES).default('none'),
  title: z.string().max(64).default('Mockup Studio'),
  titleAlign: z.enum(TITLE_ALIGNMENTS).default('center'),
  url: z.string().max(120).default('mockupstudio.local'),
  /** Title bar height as a fraction of the window width. */
  barHeight: z.number().min(0.01).max(0.2).default(0.045),
  /** Corner radius as a fraction of window width. Seeded by `borderShape`. */
  cornerRadius: z.number().min(0).max(0.1).default(0.018),
  /** Which shape preset last seeded `cornerRadius` — for the control's own state. */
  borderShape: z.enum(BORDER_SHAPES).default('curved'),
  trafficLights: z.boolean().default(true),
  /** Grey traffic lights, as an unfocused window has. */
  trafficLightsMuted: z.boolean().default(false),
  tabs: z.number().int().min(0).max(6).default(2),
  dark: z.boolean().default(false),
  /** Take the chrome colour from the screenshot's palette. */
  colorMatch: z.boolean().default(false),
  chrome: hexSchema.default('#e9e7e2'),
  /** The container's visual treatment — glass, inset, outline, border. */
  containerStyle: z.enum(CONTAINER_STYLES).default('default'),
  /** Padding around the window, as a fraction of width. Leaves room for shadow. */
  margin: z.number().min(0).max(0.3).default(0.06),
  /** Which shadow preset seeds the shadow's blur/offset/spread geometry. */
  shadowStyle: z.enum(SHADOW_STYLES).default('spread'),
  /** Shadow opacity. Ignored when `shadowStyle` is "none". */
  shadow: unitSchema.default(0.35),
  /** Backdrop behind the window in a flat export. */
  background: hexSchema.default('#f6f4ef'),
  transparentBackground: z.boolean().default(true),
  /** Render the screenshot on the backdrop with no container chrome at all. */
  hideMockup: z.boolean().default(false),
})

export type FlatConfig = z.infer<typeof flatSchema>

export const defaultFlat = (): FlatConfig => flatSchema.parse({})
