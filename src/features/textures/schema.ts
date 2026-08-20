import { z } from 'zod'
import { unitSchema } from '@/lib/schema/primitives'

/**
 * Procedural surface texture, layered on top of a material's own finish.
 *
 * Generated at runtime from these parameters alone — never a bundled image —
 * so a preset that saves a texture reproduces exactly, and the same six knobs
 * drive the device body, the device frame and the pedestal alike. See
 * `maps.ts` for how a config becomes actual roughness + normal maps.
 */
export const TEXTURE_KINDS = [
  'none',
  'noise',
  'grain',
  'brushed',
  'scratches',
  'weave',
] as const
export type SurfaceTextureKind = (typeof TEXTURE_KINDS)[number]

export const TEXTURE_DIRECTIONS = ['horizontal', 'vertical'] as const
export type SurfaceTextureDirection = (typeof TEXTURE_DIRECTIONS)[number]

export const surfaceTextureSchema = z.object({
  kind: z.enum(TEXTURE_KINDS).default('none'),
  /** Tile frequency baked into the generated map — higher reads as finer grain. */
  scale: z.number().min(0.25).max(8).default(2),
  /** Normal-map depth: how strongly the surface appears to bump under light. */
  strength: unitSchema.default(0.4),
  /** Roughness variation the pattern paints in, around the finish's own value. */
  contrast: unitSchema.default(0.35),
  /** Only the brushed and scratch patterns are directional. */
  direction: z.enum(TEXTURE_DIRECTIONS).default('vertical'),
  /** Reproducibility: the same seed always regenerates the same look. */
  seed: z.number().int().min(0).max(9999).default(1),
})
export type SurfaceTextureConfig = z.infer<typeof surfaceTextureSchema>

export const TEXTURE_LABELS: Record<SurfaceTextureKind, string> = {
  none: 'None',
  noise: 'Noise',
  grain: 'Fine grain',
  brushed: 'Brushed metal',
  scratches: 'Scratches',
  weave: 'Woven fabric',
}

export const TEXTURE_DIRECTION_LABELS: Record<SurfaceTextureDirection, string> = {
  horizontal: 'Horizontal',
  vertical: 'Vertical',
}

/** Kinds whose pattern actually runs in a direction. */
export const DIRECTIONAL_KINDS: readonly SurfaceTextureKind[] = ['brushed', 'scratches']

export const defaultSurfaceTexture = (): SurfaceTextureConfig =>
  surfaceTextureSchema.parse({})
