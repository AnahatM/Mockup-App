import { z } from 'zod'
import { EASINGS } from '@/lib/math/easing'

export const animationSchema = z.object({
  clip: z.string().default('none'),
  /** Seconds for one cycle. */
  duration: z.number().min(0.2).max(60).default(6),
  easing: z.enum(EASINGS).default('ease-in-out'),
  loop: z.boolean().default(true),
  amplitude: z.number().min(-3).max(3).default(1),
  playing: z.boolean().default(true),
  /** Current position through the cycle, 0-1. Scrubbing writes here. */
  progress: z.number().min(0).max(1).default(0),
})

export type AnimationConfig = z.infer<typeof animationSchema>

export const defaultAnimation = (): AnimationConfig => animationSchema.parse({})
