import { contrastRatio, isDark } from '@/lib/color/contrast'
import { mix } from '@/lib/color/hex'
import { shift } from '@/lib/color/hsl'
import type { BackdropConfig } from '../schema'

/**
 * Gradient backdrops derived from the uploaded screenshot's own colours.
 *
 * The point is a backdrop that belongs with the product rather than a generic
 * grey — but "belongs with" is not the same as "matches". A backdrop painted in
 * the screenshot's dominant colour camouflages the very thing it is behind, so
 * every recipe here either pulls away from that colour or drops far enough in
 * lightness to stay separate from it. `separate()` is where that is enforced.
 *
 * Pure: hex strings in, backdrop configs out. Deterministic, because a preset
 * that saved one of these has to reproduce it exactly — which also means no
 * `Math.random()` anywhere in here.
 */

export interface AdaptiveBackdrop {
  id: string
  label: string
  /** The fields this recipe sets. Everything else on the backdrop is left as
   *  the user had it, so applying one does not silently reset their glow size. */
  config: Pick<BackdropConfig, 'mode' | 'color' | 'accent' | 'angle'>
}

/** Below this, two colours are too close to read as figure and ground. */
const MIN_SEPARATION = 1.35

/**
 * Pushes `candidate` away from `subject` until they are distinguishable,
 * darkening a light pair and lightening a dark one so the move never lands on
 * the muddy middle. Gives up after a few steps rather than looping — an
 * unreadable extreme is worse than a slightly close backdrop.
 */
function separate(candidate: string, subject: string): string {
  let result = candidate
  for (let step = 0; step < 4; step += 1) {
    if (contrastRatio(result, subject) >= MIN_SEPARATION) return result
    const away = isDark(subject) ? '#ffffff' : '#0d0d10'
    result = mix(result, away, 0.18)
  }
  return result
}

export function deriveBackdrops(palette: readonly string[]): AdaptiveBackdrop[] {
  const dominant = palette[0]
  // Nothing to adapt to. `extractPalette` deliberately skips near-white,
  // near-black and near-grey, so a greyscale UI screenshot legitimately yields
  // an empty palette — that is not an error, it just means there is no brand
  // colour to build on, and offering zero suggestions says so honestly.
  if (!dominant) return []

  const second = palette[1] ?? shift(dominant, { rotate: 24 })

  return [
    tint(dominant),
    duotone(dominant, second),
    spotlight(dominant),
    complement(dominant),
    deep(dominant),
  ]
}

/** The safe default: near-neutral, only nudged towards the product's hue. A
 *  product shot should not have to fight its own background. */
function tint(dominant: string): AdaptiveBackdrop {
  return {
    id: 'tint',
    label: 'Tint',
    config: {
      mode: 'gradient',
      color: separate(
        shift(dominant, { rotate: 0, saturation: 0.14, lightness: 0.82 }),
        dominant,
      ),
      accent: shift(dominant, { rotate: 0, saturation: 0.08, lightness: 0.95 }),
      angle: 0,
    },
  }
}

/** The two most distinct colours in the shot, as the two ends of the sweep. */
function duotone(dominant: string, second: string): AdaptiveBackdrop {
  return {
    id: 'duotone',
    label: 'Duotone',
    config: {
      mode: 'gradient',
      color: separate(shift(second, { lightness: 0.34 }), dominant),
      accent: separate(shift(dominant, { lightness: 0.62 }), dominant),
      angle: Math.PI / 4,
    },
  }
}

/** A pool of the product's colour on a much darker ground. */
function spotlight(dominant: string): AdaptiveBackdrop {
  return {
    id: 'spotlight',
    label: 'Spotlight',
    config: {
      mode: 'glow',
      color: shift(dominant, { saturation: 0.35, lightness: 0.08 }),
      accent: shift(dominant, { saturation: 0.55, lightness: 0.42 }),
      angle: 0,
    },
  }
}

/** Rotated towards the opposite hue and desaturated, so the product pops
 *  against it instead of blending into it. */
function complement(dominant: string): AdaptiveBackdrop {
  return {
    id: 'complement',
    label: 'Complement',
    config: {
      mode: 'gradient',
      color: shift(dominant, { rotate: 170, saturation: 0.2, lightness: 0.7 }),
      accent: shift(dominant, { rotate: 190, saturation: 0.12, lightness: 0.88 }),
      angle: Math.PI / 6,
    },
  }
}

/** Dark and low-saturation, for a moody shot. Separation comes from the
 *  lightness gap rather than from hue, so it works for any dominant colour. */
function deep(dominant: string): AdaptiveBackdrop {
  return {
    id: 'deep',
    label: 'Deep',
    config: {
      mode: 'gradient',
      color: shift(dominant, { saturation: 0.28, lightness: 0.1 }),
      accent: shift(dominant, { saturation: 0.34, lightness: 0.26 }),
      angle: Math.PI / 2,
    },
  }
}
