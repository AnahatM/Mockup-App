import { z } from 'zod'

/**
 * Shared Zod building blocks.
 *
 * Every scene value is defined once here or in a feature schema; the TypeScript
 * type, the store shape, the preset manifest and import validation all derive
 * from it. See docs/adr/0004-zod-config-source-of-truth.md.
 */

/** Canonical six-digit hex. Rejects shorthand so stored values are uniform. */
export const hexSchema = z
  .string()
  .regex(/^#[\da-f]{6}$/i, 'Expected a hex colour like #1a1a18')

export const vec3Schema = z.tuple([z.number(), z.number(), z.number()])

export type Vec3Tuple = z.infer<typeof vec3Schema>

/** A 0-1 ratio, used for opacities and normalised amounts. */
export const unitSchema = z.number().min(0).max(1)

/** Degrees stored as radians. */
export const radiansSchema = z
  .number()
  .min(-Math.PI * 4)
  .max(Math.PI * 4)

export const idSchema = z.string().min(1).max(64)
