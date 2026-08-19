import type { FinishKind } from '../spec/types'

/**
 * Physical parameters per surface finish.
 *
 * Values are chosen to be *physically plausible* rather than tuned to look good
 * under one particular rig: metals are fully metallic, dielectrics are not, and
 * the difference between brushed titanium and polished steel is roughness and
 * anisotropy, which is what it actually is.
 */
export interface Finish {
  metalness: number
  roughness: number
  /** Directional highlight stretch — the signature of a brushed rail. */
  anisotropy?: number
  /** Radians. Rails are brushed along their length. */
  anisotropyRotation?: number
  clearcoat?: number
  clearcoatRoughness?: number
  /** Which generated map to use, if any. */
  map?: 'brushed-v' | 'brushed-h' | 'speckle'
  /** Roughness variation baked into the generated map. */
  mapContrast?: number
  iridescence?: number
  reflectivity?: number
}

export const FINISHES: Record<FinishKind, Finish> = {
  titanium: {
    metalness: 1,
    roughness: 0.34,
    anisotropy: 0.55,
    anisotropyRotation: Math.PI / 2,
    map: 'brushed-v',
    mapContrast: 0.1,
  },
  aluminium: {
    metalness: 1,
    roughness: 0.26,
    anisotropy: 0.35,
    anisotropyRotation: Math.PI / 2,
    map: 'brushed-v',
    mapContrast: 0.07,
  },
  /** Bead-blasted anodised aluminium: metal, but with no directional grain. */
  anodised: {
    metalness: 1,
    roughness: 0.46,
    map: 'speckle',
    mapContrast: 0.05,
  },
  steel: {
    metalness: 1,
    roughness: 0.12,
    anisotropy: 0.2,
    anisotropyRotation: Math.PI / 2,
    map: 'brushed-v',
    mapContrast: 0.04,
  },
  /** Mirror-polished metal, as on a stainless band. */
  'polished-metal': {
    metalness: 1,
    roughness: 0.04,
  },
  'matte-glass': {
    metalness: 0,
    roughness: 0.52,
    clearcoat: 0.5,
    clearcoatRoughness: 0.45,
    map: 'speckle',
    mapContrast: 0.05,
    reflectivity: 0.45,
  },
  'gloss-glass': {
    metalness: 0,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    reflectivity: 0.6,
  },
  ceramic: {
    metalness: 0,
    roughness: 0.28,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
    reflectivity: 0.4,
  },
  'soft-plastic': {
    metalness: 0,
    roughness: 0.72,
    map: 'speckle',
    mapContrast: 0.08,
    reflectivity: 0.28,
  },
  'gloss-plastic': {
    metalness: 0,
    roughness: 0.14,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
    reflectivity: 0.5,
  },
}

/** Human labels, for the finish pickers. */
export const FINISH_LABELS: Record<FinishKind, string> = {
  titanium: 'Brushed titanium',
  aluminium: 'Brushed aluminium',
  anodised: 'Anodised aluminium',
  steel: 'Brushed steel',
  'polished-metal': 'Polished metal',
  'matte-glass': 'Matte glass',
  'gloss-glass': 'Glossy glass',
  ceramic: 'Ceramic',
  'soft-plastic': 'Soft-touch plastic',
  'gloss-plastic': 'Glossy plastic',
}

export const FINISH_KINDS = Object.keys(FINISHES) as FinishKind[]

/**
 * Screen glass.
 *
 * A separate axis from the body finishes because a display is always glass —
 * the only real question is whether it is glossy or has an anti-glare etch,
 * and that changes how much of the room it mirrors back.
 */
export const SCREEN_FINISHES = ['glossy', 'matte'] as const
export type ScreenFinish = (typeof SCREEN_FINISHES)[number]

export const SCREEN_FINISH_LABELS: Record<ScreenFinish, string> = {
  glossy: 'Glossy',
  matte: 'Matte / anti-glare',
}

export const SCREEN_FINISH_VALUES: Record<
  ScreenFinish,
  { roughness: number; clearcoat: number; clearcoatRoughness: number }
> = {
  glossy: { roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04 },
  matte: { roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.5 },
}
