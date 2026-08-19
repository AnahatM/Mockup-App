import { z } from 'zod'
import { hexSchema, vec3Schema } from '@/lib/schema/primitives'

/**
 * User-editable device state — the part that ends up in a saved preset, and so
 * the part that is validated by Zod. The specs themselves are authored in-repo
 * and checked by the compiler instead.
 */
export const deviceConfigSchema = z.object({
  specId: z.string().default('iphone-pro'),
  colorway: z.string().default('natural-titanium'),
  bodyColor: hexSchema.default('#c3bdb3'),
  frameColor: hexSchema.default('#a09a91'),
  /** Per-device detail toggles. */
  showCutout: z.boolean().default(true),
  showCameraBump: z.boolean().default(true),
  showButtons: z.boolean().default(true),
  showRails: z.boolean().default(true),
  screenBrightness: z.number().min(0).max(4).default(1.1),
  /** Device orientation in radians. */
  rotation: vec3Schema.default([0, -0.38, 0]),
  landscape: z.boolean().default(false),
  /** Lifts the device off the pedestal, for floating hero shots. */
  levitate: z.number().min(0).max(3).default(0),
})

export type DeviceConfig = z.infer<typeof deviceConfigSchema>
