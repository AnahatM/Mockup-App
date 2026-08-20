import { z } from 'zod'
import { hexSchema } from '@/lib/schema/primitives'

/**
 * App Store screenshot mode: one, two or three devices composed in a single
 * frame with a headline, the way a real store listing image is built.
 *
 * A separate mode rather than N live devices in the 3D scene (see
 * `composeShowcase.ts` for the full rationale): the rest of the app assumes a
 * single device, and reusing that single scene N times — once per slot, each
 * capture isolated to just the device via existing scene config — keeps
 * lighting/backdrop/camera exactly as coherent as a normal export while
 * touching none of the contested scene files.
 */

export const SHOWCASE_LAYOUTS = [
  'single',
  'pair',
  'hero-flank',
  'stagger-row',
  'fan-overlay',
] as const
export type ShowcaseLayoutId = (typeof SHOWCASE_LAYOUTS)[number]

export const TEXT_POSITIONS = ['above', 'below', 'overlay'] as const
export type TextPosition = (typeof TEXT_POSITIONS)[number]

export const TEXT_ALIGNMENTS = ['left', 'center', 'right'] as const
export type TextAlignment = (typeof TEXT_ALIGNMENTS)[number]

export const TEXT_WEIGHTS = ['regular', 'bold'] as const
export type TextWeight = (typeof TEXT_WEIGHTS)[number]

/**
 * `size` is a font size in px at a 1600px-wide reference canvas, not an
 * absolute pixel size — the same headline must read the same way whether the
 * export is a 1179px phone shot or an 8192px custom banner. `textBlock.ts`
 * scales it to the real canvas at render time.
 */
export const showcaseTextSchema = z.object({
  headline: z.string().max(80).default(''),
  subheading: z.string().max(120).default(''),
  position: z.enum(TEXT_POSITIONS).default('above'),
  align: z.enum(TEXT_ALIGNMENTS).default('center'),
  size: z.number().min(20).max(140).default(56),
  weight: z.enum(TEXT_WEIGHTS).default('bold'),
  color: hexSchema.default('#141414'),
})

export type ShowcaseTextConfig = z.infer<typeof showcaseTextSchema>

export const showcaseSchema = z.object({
  enabled: z.boolean().default(false),
  layout: z.enum(SHOWCASE_LAYOUTS).default('hero-flank'),
  backgroundColor: hexSchema.default('#f4f2ec'),
  /**
   * One entry per slot, index-aligned: a recent upload id, or `null` to fall
   * back to the currently loaded screenshot. Missing/short arrays mean every
   * slot shares the live screenshot, which is the common case.
   */
  screenshotIds: z.array(z.string().nullable()).max(3).default([]),
  text: showcaseTextSchema.prefault({}),
})

export type ShowcaseConfig = z.infer<typeof showcaseSchema>

export const defaultShowcase = (): ShowcaseConfig => showcaseSchema.parse({})
