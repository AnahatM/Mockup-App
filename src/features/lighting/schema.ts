import { z } from 'zod'
import { hexSchema, idSchema, vec3Schema } from '@/lib/schema/primitives'

/**
 * Lighting configuration.
 *
 * The studio environment is built from parametric area lights rather than an HDRI
 * file, which is what lets every rim light and glow be a live, colour-bindable
 * knob. See docs/adr/0003-parametric-lighting.md.
 */

export const LIGHT_FORMS = ['rect', 'circle', 'ring'] as const
export type LightForm = (typeof LIGHT_FORMS)[number]

export const lightSchema = z.object({
  id: idSchema,
  name: z.string().max(48).default('Light'),
  enabled: z.boolean().default(true),
  form: z.enum(LIGHT_FORMS).default('rect'),
  position: vec3Schema.default([0, 2, 3]),
  /** Radians. Lights always face the origin unless rotated away from it. */
  rotation: vec3Schema.default([0, 0, 0]),
  /** For `rect` this is width/height; `circle` and `ring` use the first value. */
  scale: vec3Schema.default([2, 2, 1]),
  color: hexSchema.default('#ffffff'),
  intensity: z.number().min(0).max(30).default(3),
  /** Draws the light itself in the reflection but not as visible geometry. */
  visibleInBackground: z.boolean().default(false),
})

export type LightConfig = z.infer<typeof lightSchema>

export const lightingSchema = z.object({
  /** Name of the applied preset, or 'custom' once the user edits a light. */
  preset: z.string().default('studio'),
  /** Overall strength of the generated environment map. */
  environmentIntensity: z.number().min(0).max(5).default(1),
  /** Soft fill so unlit faces never crush to pure black. */
  ambient: z.number().min(0).max(3).default(0.25),
  lights: z.array(lightSchema).max(8).default([]),
})

export type LightingConfig = z.infer<typeof lightingSchema>
