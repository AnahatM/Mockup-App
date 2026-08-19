import { z } from 'zod'
import { hexSchema, unitSchema } from '@/lib/schema/primitives'

/**
 * Scene configuration: everything behind and beneath the product.
 *
 * Every field carries a `.default()`, which means `sceneSchema.parse({})` yields
 * the canonical default scene — so defaults live with the schema instead of in a
 * second, driftable constant.
 */

export const BACKDROP_MODES = [
  'transparent',
  'solid',
  'gradient',
  'glow',
  'cyclorama',
  'grid',
] as const

export const backdropSchema = z.object({
  mode: z.enum(BACKDROP_MODES).default('glow'),
  /** Base colour, and the outer colour for gradient and glow modes. */
  color: hexSchema.default('#141416'),
  /** Highlight colour: gradient end, glow centre, grid lines. */
  accent: hexSchema.default('#394051'),
  /** Gradient direction, in radians. */
  angle: z.number().default(0),
  /** How far the glow reaches, as a fraction of the viewport. */
  glowRadius: z.number().min(0.05).max(2).default(0.65),
  glowStrength: unitSchema.default(0.8),
  gridSize: z.number().min(0.05).max(4).default(0.5),
  gridOpacity: unitSchema.default(0.12),
})

export const PEDESTAL_SHAPES = ['disc', 'square', 'none'] as const

export const pedestalSchema = z.object({
  enabled: z.boolean().default(true),
  shape: z.enum(PEDESTAL_SHAPES).default('disc'),
  radius: z.number().min(0.2).max(4).default(0.95),
  height: z.number().min(0.01).max(1).default(0.06),
  color: hexSchema.default('#17181b'),
  roughness: unitSchema.default(0.86),
  metalness: unitSchema.default(0.04),
})

export const shadowSchema = z.object({
  enabled: z.boolean().default(true),
  opacity: unitSchema.default(0.55),
  blur: z.number().min(0).max(10).default(2.4),
  /** Distance below the product at which the shadow fully fades. */
  far: z.number().min(0.1).max(10).default(1.6),
  scale: z.number().min(0.5).max(20).default(6),
})

export const postSchema = z.object({
  bloomEnabled: z.boolean().default(true),
  bloomIntensity: z.number().min(0).max(4).default(0.55),
  bloomThreshold: unitSchema.default(0.72),
  bloomSmoothing: unitSchema.default(0.28),
  vignetteEnabled: z.boolean().default(true),
  vignetteDarkness: unitSchema.default(0.45),
  chromaticAberration: z.number().min(0).max(0.01).default(0.0002),
  /** Depth of field is off by default — it is expensive and easy to overdo. */
  depthOfFieldEnabled: z.boolean().default(false),
  focusDistance: unitSchema.default(0.03),
  focalLength: unitSchema.default(0.04),
  bokehScale: z.number().min(0).max(12).default(3),
})

export const sceneSchema = z.object({
  backdrop: backdropSchema.prefault({}),
  pedestal: pedestalSchema.prefault({}),
  shadow: shadowSchema.prefault({}),
  post: postSchema.prefault({}),
  /** Overall render exposure, applied by the tone mapper. */
  exposure: z.number().min(0).max(3).default(1),
})

export type BackdropMode = (typeof BACKDROP_MODES)[number]
export type PedestalShape = (typeof PEDESTAL_SHAPES)[number]
export type BackdropConfig = z.infer<typeof backdropSchema>
export type PedestalConfig = z.infer<typeof pedestalSchema>
export type ShadowConfig = z.infer<typeof shadowSchema>
export type PostConfig = z.infer<typeof postSchema>
export type SceneConfig = z.infer<typeof sceneSchema>

export const defaultScene = (): SceneConfig => sceneSchema.parse({})
