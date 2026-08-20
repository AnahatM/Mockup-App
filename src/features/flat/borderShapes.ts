import type { BorderShape } from './schema'

/**
 * Radius (as a fraction of window width) each shape preset seeds `cornerRadius`
 * to. The radius itself is stored as a plain number so the slider can move it
 * away from a preset without needing a "custom" state — the same pattern the
 * camera's angle presets use for position/target/fov.
 */
export const BORDER_SHAPE_RADII: Readonly<Record<BorderShape, number>> = {
  sharp: 0,
  curved: 0.018,
  round: 0.06,
}

export function seedRadius(shape: BorderShape): number {
  return BORDER_SHAPE_RADII[shape]
}
