import { hexToRgb } from '@/lib/color/hex'
import type { ShadowStyle } from './schema'

/**
 * A shadow style's drawing parameters.
 *
 * `spread` grows the shadow's silhouette before it is blurred — the nearest a
 * canvas `shadowBlur` gets to CSS's spread radius, since canvas shadows only
 * expose blur and offset natively. "Adaptive" reuses "spread"'s geometry and
 * swaps the colour for the screenshot's dominant colour instead of black.
 */
export interface ShadowLook {
  /** Blur radius, as a fraction of window width. */
  blur: number
  /** Vertical offset, as a fraction of window width. */
  offsetY: number
  /** Growth applied to the silhouette before blurring, as a fraction of window width. */
  spread: number
  colorMode: 'black' | 'adaptive'
}

type ActiveShadowStyle = Exclude<ShadowStyle, 'none'>

const GEOMETRY: Readonly<Record<ActiveShadowStyle, Omit<ShadowLook, 'colorMode'>>> = {
  // Matches the window mockup's original constants, so an old preset with no
  // `shadowStyle` field (defaulting here to "spread") renders unchanged.
  spread: { blur: 0.05, offsetY: 0.014, spread: 0.012 },
  // Tight and close, like the screenshot is resting directly on the backdrop.
  hug: { blur: 0.018, offsetY: 0.006, spread: 0 },
  adaptive: { blur: 0.05, offsetY: 0.014, spread: 0.012 },
}

export function resolveShadowLook(style: ActiveShadowStyle): ShadowLook {
  return { ...GEOMETRY[style], colorMode: style === 'adaptive' ? 'adaptive' : 'black' }
}

/**
 * Resolves a shadow's CSS colour at the given opacity.
 *
 * `dominant` is the screenshot's dominant colour, already extracted by the
 * app's brand-palette pipeline (`mediaPalette`) — this does not run its own
 * colour extraction. Falls back to black when nothing is loaded yet.
 */
export function shadowColor(
  look: ShadowLook,
  opacity: number,
  dominant: string | null,
): string {
  if (look.colorMode === 'adaptive' && dominant) {
    const { r, g, b } = hexToRgb(dominant)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  return `rgba(0, 0, 0, ${opacity})`
}
