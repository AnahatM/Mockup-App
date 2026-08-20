import { z } from 'zod'

/**
 * Crop configuration for the uploaded screenshot.
 *
 * `rect` is normalised (0-1) against the ORIGINAL upload's own pixel
 * dimensions — never the device screen or the viewport — so it keeps meaning
 * across a device swap and at any export resolution. It lives inside
 * `ScreenConfig` (see `features/media/schema.ts`) because it is user config
 * for the current media, serialised the same way fit/zoom/pan already are.
 */
export const cropRectSchema = z.object({
  x: z.number().min(0).max(1).default(0),
  y: z.number().min(0).max(1).default(0),
  width: z.number().min(0.01).max(1).default(1),
  height: z.number().min(0.01).max(1).default(1),
})

export type CropRect = z.infer<typeof cropRectSchema>

export const IDENTITY_CROP_RECT: CropRect = { x: 0, y: 0, width: 1, height: 1 }

/**
 * `free` applies no aspect constraint. `device` matches the *selected
 * device's* real screen aspect (see `deviceAspect.ts`) — resolved at use
 * time, not stored as a number, so it keeps tracking the device if it later
 * changes. The rest are the common ratios an editor is expected to offer.
 */
export const CROP_ASPECT_PRESETS = ['free', 'device', '16:9', '4:3', '1:1', '9:16'] as const
export type CropAspectPreset = (typeof CROP_ASPECT_PRESETS)[number]

export const cropSchema = z.object({
  rect: cropRectSchema.default(IDENTITY_CROP_RECT),
  aspectPreset: z.enum(CROP_ASPECT_PRESETS).default('free'),
})

export type CropConfig = z.infer<typeof cropSchema>

export const defaultCrop = (): CropConfig => cropSchema.parse({})
