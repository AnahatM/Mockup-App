import type { ShowcaseLayoutId } from './schema'

/**
 * One device's position in a layout, in a normalised design space: `cx`/`cy`
 * are fractions (0-1) of the content area, `scale` is the device's height as
 * a fraction of the content area's shorter side, `z` is paint order (higher
 * paints on top — so a "hero" can sit in front of its flanking devices).
 */
export interface SlotDesign {
  cx: number
  cy: number
  scale: number
  rotationDeg: number
  z: number
}

/**
 * The gallery. Five arrangements covering the classic App Store patterns —
 * a lone hero, a side-by-side pair, a hero flanked by two angled devices, a
 * staggered row, and an overlapping fan — plus enough variety that every
 * layout is visibly distinct once composed (see `layoutMath.test.ts`).
 */
export const LAYOUT_DESIGNS: Record<ShowcaseLayoutId, readonly SlotDesign[]> = {
  single: [{ cx: 0.5, cy: 0.52, scale: 0.78, rotationDeg: 0, z: 0 }],

  pair: [
    { cx: 0.32, cy: 0.56, scale: 0.62, rotationDeg: -9, z: 0 },
    { cx: 0.68, cy: 0.48, scale: 0.62, rotationDeg: 9, z: 1 },
  ],

  'hero-flank': [
    { cx: 0.22, cy: 0.6, scale: 0.48, rotationDeg: -18, z: 0 },
    { cx: 0.78, cy: 0.6, scale: 0.48, rotationDeg: 18, z: 1 },
    { cx: 0.5, cy: 0.48, scale: 0.7, rotationDeg: 0, z: 2 },
  ],

  'stagger-row': [
    { cx: 0.17, cy: 0.62, scale: 0.44, rotationDeg: -6, z: 0 },
    { cx: 0.5, cy: 0.4, scale: 0.5, rotationDeg: 0, z: 1 },
    { cx: 0.83, cy: 0.62, scale: 0.44, rotationDeg: 6, z: 2 },
  ],

  'fan-overlay': [
    { cx: 0.38, cy: 0.56, scale: 0.56, rotationDeg: -15, z: 0 },
    { cx: 0.62, cy: 0.56, scale: 0.56, rotationDeg: 15, z: 1 },
    { cx: 0.5, cy: 0.5, scale: 0.6, rotationDeg: 0, z: 2 },
  ],
}

export const LAYOUT_LABELS: Record<ShowcaseLayoutId, string> = {
  single: 'Single',
  pair: 'Side by side',
  'hero-flank': 'Hero + flank',
  'stagger-row': 'Staggered row',
  'fan-overlay': 'Overlapping fan',
}
