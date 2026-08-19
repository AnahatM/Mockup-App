import { z } from 'zod'

export const exportSchema = z.object({
  sizePreset: z.string().default('viewport'),
  customWidth: z.number().int().min(64).max(8192).default(1600),
  customHeight: z.number().int().min(64).max(8192).default(1200),
  /** Multiplies the resolved size. 2 is a retina still. */
  scale: z.number().min(1).max(4).default(2),
  /** Renders with no backdrop, preserving alpha. */
  transparent: z.boolean().default(false),
  filename: z.string().max(64).default('mockup'),

  /* Video */
  fps: z.number().int().min(12).max(60).default(30),
  /** Seconds. Defaults to one animation cycle when recording starts. */
  videoDuration: z.number().min(0.5).max(60).default(6),
  bitrateMbps: z.number().min(1).max(50).default(12),
})

export type ExportConfig = z.infer<typeof exportSchema>

export const defaultExport = (): ExportConfig => exportSchema.parse({})
