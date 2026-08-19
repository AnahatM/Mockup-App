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

export const flatSchema = z.object({
  style: z.enum(WINDOW_STYLES).default('none'),
  title: z.string().max(64).default('Mockup Studio'),
  titleAlign: z.enum(TITLE_ALIGNMENTS).default('center'),
  url: z.string().max(120).default('mockupstudio.local'),
  /** Title bar height as a fraction of the window width. */
  barHeight: z.number().min(0.01).max(0.2).default(0.045),
  cornerRadius: z.number().min(0).max(0.1).default(0.018),
  trafficLights: z.boolean().default(true),
  /** Grey traffic lights, as an unfocused window has. */
  trafficLightsMuted: z.boolean().default(false),
  tabs: z.number().int().min(0).max(6).default(2),
  dark: z.boolean().default(false),
  /** Take the chrome colour from the screenshot's palette. */
  colorMatch: z.boolean().default(false),
  chrome: hexSchema.default('#e9e7e2'),
  /** Padding around the window, as a fraction of width. Leaves room for shadow. */
  margin: z.number().min(0).max(0.3).default(0.06),
  shadow: unitSchema.default(0.35),
  /** Backdrop behind the window in a flat export. */
  background: hexSchema.default('#f6f4ef'),
  transparentBackground: z.boolean().default(true),
})

export type FlatConfig = z.infer<typeof flatSchema>

export const defaultFlat = (): FlatConfig => flatSchema.parse({})
