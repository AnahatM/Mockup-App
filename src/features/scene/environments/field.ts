import { fractalNoise } from '@/features/textures'
import type { Placement } from './instances'
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

/**
 * How the product's height is shared between a tile's resting height and the
 * distance it may rise.
 *
 * The structure sliders were authored with no reference to scale. A tile depth
 * of 3 and a pulse of 3 are unremarkable behind a 6-unit monitor and absurd
 * behind a 1.5-unit phone: together with the relief gain they built tiles
 * fifteen units tall, closed the field over the camera, and turned the whole
 * viewport flat grey. Nothing failed — it rendered, it animated, it was simply
 * not a scene any more.
 *
 * So the ceiling is the product's own height, split between the two. A
 * backdrop is behind the product by definition and towering over it is never
 * the shot anyone wanted; splitting it rather than capping the sum keeps the
 * pulse alive when the depth slider is at the top, instead of silently
 * leaving it nothing to move through.
 *
 * Neither share binds at the defaults — a phone's ceiling is 1.47 units
 * against a resting height of 0.48 and a rise of 0.45 — so the look everyone
 * has already seen is untouched, and the caps only bite where the result was
 * unusable anyway.
 */
const REST_SHARE = 0.6
const RISE_SHARE = 0.4

/** How many noise cells span the field. Low enough that neighbouring tiles
 *  share a slope rather than each picking an unrelated height, which is the
 *  difference between terrain and static. */
const NOISE_CELLS = 2.5

/**
 * A tile's resting height.
 *
 * `falloff` multiplies the noise, so the field is flattest at the origin and
 * gains relief outward. `clearance` multiplies it again, which is what
 * actually holds the product's own patch of floor flat — `falloff` is a
 * fraction of the field's extent and knows nothing about the size of the
 * device standing on it. Inside the clearance the tile is exactly `depth`
 * tall, which is the plateau `TileField` sinks the whole field onto.
 */
export function tileHeight(cell: Cell, config: StructureConfig, ceiling = Infinity): number {
  const rest = Math.min(config.depth, ceiling * REST_SHARE)
  if (config.relief === 0) return rest
  const n = fractalNoise(
    cell.x / config.extent / 2 + 0.5,
    cell.z / config.extent / 2 + 0.5,
    NOISE_CELLS,
    NOISE_CELLS,
    config.seed,
    3,
  )
  const lift = config.relief * RELIEF_GAIN * cell.falloff * cell.clearance * n
  return Math.min(rest * (1 + lift), ceiling * REST_SHARE)
}

/** 0-1, for blending a tile's colour between base and accent by how tall it
 *  stands — so the field reads as lit rather than flat-painted. */
export function tileTint(height: number, config: StructureConfig, ceiling = Infinity): number {
  const rest = Math.min(config.depth, ceiling * REST_SHARE)
  const tallest = Math.min(rest * (1 + config.relief * RELIEF_GAIN), ceiling * REST_SHARE)
  if (tallest <= rest) return 0
  return Math.min(1, (height - rest) / (tallest - rest))
}

/**
 * How far a block has risen off the floor at `time` seconds.
 *
 * The phase is offset by the cell's distance from the origin, so the field
 * ripples outward from under the product instead of every block pumping in
 * unison — which reads as a machine rather than a wave. Always non-negative,
 * so a block never sinks through the floor it is standing on.
 *
 * Scaled by the cell's clearance, so the wave dies out under the product and
 * builds back up around it. Without that the block at the origin rose by up to
 * three world units on every cycle, straight through the device — the field
 * had no idea anything was standing there.
 */
export function blockRise(
  cell: Cell,
  config: StructureConfig,
  time: number,
  ceiling = Infinity,
): number {
  if (config.pulse === 0 || cell.clearance === 0) return 0
  const peak = Math.min(config.pulse, ceiling * RISE_SHARE)
  const distance = Math.hypot(cell.x, cell.z)
  const phase = time * config.speed * Math.PI * 2 - distance * 0.9
  return peak * 0.5 * (1 + Math.sin(phase)) * cell.clearance
}

/**
 * How far the whole field is sunk, in world units.
 *
 * Inside the product's clearance every tile is exactly `depth` tall, so
 * dropping the field by that much puts the flat plateau's *top* face at y=0 —
 * which is where the device's feet, the pedestal and the contact shadow all
 * are. Without it the field stood on the floor plane and the product stood
 * buried in it, up to three units of phone underground at the top of the
 * depth slider.
 *
 * Here rather than inline in the component so it is testable: it is one
 * number, it has to agree exactly with what `tileHeight` returns under the
 * product, and a component's JSX is the one place that agreement cannot be
 * checked.
 */
export const fieldOffsetY = (config: StructureConfig, ceiling = Infinity): number =>
  -Math.min(config.depth, ceiling * REST_SHARE)

/** Footprint of one tile: the pitch, less its share left as a grout line.
 *  Takes the *fitted* pitch rather than reading `config.pitch`, so tiles grow
 *  with the spacing when a field has been coarsened to fit its budget —
 *  otherwise the field would come out as small tiles adrift in big gaps. */
export const tileFootprint = (pitch: number, gap: number): number => pitch * (1 - gap)

/**
 * Builds the per-instance placement callback for a lattice field.
 *
 * Returns a function of (index, time) rather than closing over the time, so
 * the animated and static paths share one definition of where a tile goes and
 * cannot drift apart.
 */
export function placer(
  cells: Cell[],
  heights: number[],
  config: StructureConfig,
  ceiling = Infinity,
) {
  return (index: number, time: number): Placement => {
    const cell = cells[index] ?? EMPTY_CELL
    const height = heights[index] ?? config.depth
    const rise = config.kind === 'blocks' ? blockRise(cell, config, time, ceiling) : 0

    return {
      // The geometry is unit-height and centred, so a tile resting on the
      // floor sits at half its own height.
      position: [cell.x, height / 2 + rise, cell.z],
      scale: [1, height, 1],
      tint: tileTint(height, config, ceiling),
    }
  }
}

/** Stands in for an index outside the cell list, which cannot happen but which
 *  `noUncheckedIndexedAccess` is right to make us say something about. */
const EMPTY_CELL: Cell = { x: 0, z: 0, falloff: 0, clearance: 0 }
