import { z } from 'zod'
import { FIT_MODES } from '@/lib/media/fit'
import { hexSchema } from '@/lib/schema/primitives'

/** How the uploaded media is placed on the screen, and how video plays back. */
export const screenSchema = z.object({
  fit: z.enum(FIT_MODES).default('cover'),
  zoom: z.number().min(0.2).max(4).default(1),
  panX: z.number().min(-1).max(1).default(0),
  panY: z.number().min(-1).max(1).default(0),
  /** Shows around the media in `contain`, and when nothing is loaded. */
  background: hexSchema.default('#0b0d12'),

  /* Video playback */
  playing: z.boolean().default(true),
  loop: z.boolean().default(true),
  muted: z.boolean().default(true),
  rate: z.number().min(0.25).max(4).default(1),
})

export type ScreenConfig = z.infer<typeof screenSchema>

export const defaultScreen = (): ScreenConfig => screenSchema.parse({})

/**
 * The loaded media itself.
 *
 * Held outside the serialisable config because `url` is a session-scoped object
 * URL. Saving a preset either omits the media or embeds it as a data URL — see
 * docs/preset-manifest.md.
 */
export type MediaSource =
  | { kind: 'none' }
  | {
      kind: 'image' | 'video'
      url: string
      name: string
      width: number
      height: number
    }

export const mediaAspect = (source: MediaSource): number =>
  source.kind === 'none' || source.height === 0 ? 1 : source.width / source.height
