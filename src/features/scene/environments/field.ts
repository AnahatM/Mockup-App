import { fractalNoise } from '@/features/textures'
import type { Cell } from './lattice'
import type { StructureConfig } from './schema'

/**
 * How tall each tile stands, and — for the block field — where it is in its
 * oscillation.
 *
 * Pure functions of a cell and the config, with time passed in rather than
 * read from a clock, so the frame loop stays a thin caller and the shape of a
 * field is decided in one readable place.
 */

/** Relief is authored 0-1 but needs real reach in world units to be visible. */
const RELIEF_GAIN = 4

/** How many noise cells span the field. Low enough that neighbouring tiles
 *  share a slope rather than each picking an unrelated height, which is the
 *  difference between terrain and static. */
const NOISE_CELLS = 2.5

/**
 * A tile's resting height.
 *
 * `falloff` multiplies the noise, so the field is flattest at the origin and
 * gains relief outward. That is deliberate: the product stands at the origin
 * and a tile pushing up through its own contact shadow looks like a bug.
 */
export function tileHeight(cell: Cell, config: StructureConfig): number {
  if (config.relief === 0) return config.depth
  const n = fractalNoise(
    cell.x / config.extent / 2 + 0.5,
    cell.z / config.extent / 2 + 0.5,
    NOISE_CELLS,
    NOISE_CELLS,
    config.seed,
    3,
  )
  return config.depth * (1 + config.relief * RELIEF_GAIN * cell.falloff * n)
}

/** 0-1, for blending a tile's colour between base and accent by how tall it
 *  stands — so the field reads as lit rather than flat-painted. */
export function tileTint(height: number, config: StructureConfig): number {
  const ceiling = config.depth * (1 + config.relief * RELIEF_GAIN)
  if (ceiling <= config.depth) return 0
  return Math.min(1, (height - config.depth) / (ceiling - config.depth))
}

/**
 * How far a block has risen off the floor at `time` seconds.
 *
 * The phase is offset by the cell's distance from the origin, so the field
 * ripples outward from under the product instead of every block pumping in
 * unison — which reads as a machine rather than a wave. Always non-negative,
 * so a block never sinks through the floor it is standing on.
 */
export function blockRise(cell: Cell, config: StructureConfig, time: number): number {
  if (config.pulse === 0) return 0
  const distance = Math.hypot(cell.x, cell.z)
  const phase = time * config.speed * Math.PI * 2 - distance * 0.9
  return config.pulse * 0.5 * (1 + Math.sin(phase))
}

/** Footprint of one tile: the pitch, less its share left as a grout line. */
export const tileFootprint = (config: StructureConfig): number =>
  config.pitch * (1 - config.gap)
