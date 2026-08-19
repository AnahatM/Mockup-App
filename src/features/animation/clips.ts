import { ease, pingPong, type Easing } from '@/lib/math/easing'

/**
 * Animation clips.
 *
 * A clip is a pure function of normalised time to a transform. Being pure means
 * the same frame can be evaluated for live playback and for frame-accurate
 * capture, so a recording is not at the mercy of how fast the machine runs.
 */

export interface ClipFrame {
  /** Offset from the device's authored position, in scene units. */
  position: [number, number, number]
  /** Additional rotation, in radians. */
  rotation: [number, number, number]
  scale: number
  /** Camera orbit offset in radians, applied through the orbit controls. */
  orbit: number
}

export const IDENTITY: ClipFrame = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1,
  orbit: 0,
}

export interface ClipContext {
  /** 0-1 through one cycle. */
  t: number
  /** Multiplies the clip's characteristic movement. */
  amplitude: number
  easing: Easing
}

export interface AnimationClip {
  id: string
  label: string
  description: string
  /** Loops seamlessly, so recording one cycle gives a perfect loop. */
  seamless: boolean
  frame: (ctx: ClipContext) => ClipFrame
}

const TAU = Math.PI * 2

export const CLIPS: readonly AnimationClip[] = [
  {
    id: 'none',
    label: 'None',
    description: 'No motion.',
    seamless: true,
    frame: () => IDENTITY,
  },
  {
    id: 'turntable',
    label: 'Turntable',
    description: 'The product rotates on the spot.',
    seamless: true,
    // Deliberately not eased: an eased turntable stutters at the loop point.
    frame: ({ t, amplitude }) => ({
      ...IDENTITY,
      rotation: [0, t * TAU * Math.sign(amplitude || 1), 0],
    }),
  },
  {
    id: 'orbit',
    label: 'Camera orbit',
    description: 'The camera circles the product.',
    seamless: true,
    frame: ({ t, amplitude }) => ({ ...IDENTITY, orbit: t * TAU * (amplitude || 1) }),
  },
  {
    id: 'float',
    label: 'Float',
    description: 'Gentle vertical drift.',
    seamless: true,
    frame: ({ t, amplitude }) => ({
      ...IDENTITY,
      position: [0, Math.sin(t * TAU) * 0.09 * amplitude, 0],
    }),
  },
  {
    id: 'breathe',
    label: 'Breathe',
    description: 'Slow scale pulse.',
    seamless: true,
    frame: ({ t, amplitude }) => ({
      ...IDENTITY,
      scale: 1 + Math.sin(t * TAU) * 0.03 * amplitude,
    }),
  },
  {
    id: 'sway',
    label: 'Sway',
    description: 'Rocks side to side.',
    seamless: true,
    frame: ({ t, amplitude, easing }) => {
      const swing = ease(easing, pingPong(t)) * 2 - 1
      return { ...IDENTITY, rotation: [0, swing * 0.45 * amplitude, 0] }
    },
  },
  {
    id: 'tilt-in',
    label: 'Tilt in',
    description: 'Swings into frame and settles. One-shot.',
    seamless: false,
    frame: ({ t, amplitude, easing }) => {
      const p = ease(easing, t)
      return {
        ...IDENTITY,
        rotation: [0, (1 - p) * -1.1 * amplitude, 0],
        position: [(1 - p) * 0.35 * amplitude, 0, 0],
      }
    },
  },
  {
    id: 'pop-in',
    label: 'Pop in',
    description: 'Scales up with a slight overshoot. One-shot.',
    seamless: false,
    frame: ({ t, amplitude, easing }) => {
      const p = ease(easing, t)
      return { ...IDENTITY, scale: 1 - (1 - p) * 0.4 * amplitude }
    },
  },
  {
    id: 'reveal',
    label: 'Parallax reveal',
    description: 'Rises and turns into place. One-shot.',
    seamless: false,
    frame: ({ t, amplitude, easing }) => {
      const p = ease(easing, t)
      return {
        ...IDENTITY,
        position: [0, (1 - p) * -0.25 * amplitude, 0],
        rotation: [0, (1 - p) * 0.5 * amplitude, 0],
        scale: 1 - (1 - p) * 0.08 * amplitude,
      }
    },
  },
]

export function findClip(id: string): AnimationClip | undefined {
  return CLIPS.find((clip) => clip.id === id)
}
