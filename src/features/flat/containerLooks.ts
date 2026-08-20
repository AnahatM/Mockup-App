import type { ContainerStyle } from './schema'

/**
 * A container style's drawing parameters — a look, not a JSX branch.
 *
 * Canvas 2D has no `backdrop-filter`, and this same compose call also paints a
 * texture for the device screen in the 3D scene, where the canvas never sees
 * what is actually behind it. So "glass" cannot sample or blur whatever is
 * underneath the window — it approximates translucency with a lowered chrome
 * fill alpha, a tinted stroke, and a soft top-lit gradient ("sheen") drawn over
 * the content. "Inset" approximates a recessed screen with an inner shadow
 * hugging the top edge ("recess") instead of a true bevel/ambient-occlusion.
 * Both are honest approximations of the shots.so effect, not a reproduction of
 * a real frosted-glass render — see `draw/containerChrome.ts`.
 */
export interface ContainerLook {
  /** Alpha for the title-bar / shadow-silhouette chrome fill. */
  chromeOpacity: number
  /** Outer stroke around the whole frame. 0 draws none. */
  borderOpacity: number
  /** Stroke width, as a fraction of window width. */
  borderWidth: number
  /** Lightens ('light') or darkens ('dark') the chrome colour for the stroke and sheen. */
  tone: 'light' | 'dark'
  /** Soft top-to-bottom gradient over the content — the glass "sheen". 0 draws none. */
  sheenOpacity: number
  /** Inner shadow hugging the content's top edge — the inset "recess". 0 draws none. */
  recessOpacity: number
}

export const CONTAINER_LOOKS: Readonly<Record<ContainerStyle, ContainerLook>> = {
  default: {
    chromeOpacity: 1,
    borderOpacity: 0,
    borderWidth: 0,
    tone: 'light',
    sheenOpacity: 0,
    recessOpacity: 0,
  },
  'glass-light': {
    chromeOpacity: 0.5,
    borderOpacity: 0.5,
    borderWidth: 0.003,
    tone: 'light',
    sheenOpacity: 0.16,
    recessOpacity: 0,
  },
  'glass-dark': {
    chromeOpacity: 0.5,
    borderOpacity: 0.5,
    borderWidth: 0.003,
    tone: 'dark',
    sheenOpacity: 0.16,
    recessOpacity: 0,
  },
  'inset-light': {
    chromeOpacity: 1,
    borderOpacity: 0.35,
    borderWidth: 0.0025,
    tone: 'light',
    sheenOpacity: 0,
    recessOpacity: 0.28,
  },
  'inset-dark': {
    chromeOpacity: 1,
    borderOpacity: 0.35,
    borderWidth: 0.0025,
    tone: 'dark',
    sheenOpacity: 0,
    recessOpacity: 0.28,
  },
  outline: {
    chromeOpacity: 1,
    borderOpacity: 0.55,
    borderWidth: 0.0015,
    tone: 'dark',
    sheenOpacity: 0,
    recessOpacity: 0,
  },
  border: {
    chromeOpacity: 1,
    borderOpacity: 0.9,
    borderWidth: 0.008,
    tone: 'dark',
    sheenOpacity: 0,
    recessOpacity: 0,
  },
}

export function resolveContainerLook(style: ContainerStyle): ContainerLook {
  return CONTAINER_LOOKS[style]
}
