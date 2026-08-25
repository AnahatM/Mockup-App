/**
 * Where the tiles go.
 *
 * Pure position maths — no three.js, no React — so a structure component is
 * only ever "build a lattice, then write matrices", and so a layout can be
 * reasoned about without a renderer in the way.
 */

import { clearanceAt } from './clearance'

const ROOT3 = Math.sqrt(3)

export interface Cell {
  /** Tile centre on the ground plane. */
  x: number
  z: number
  /**
   * Radial distance from the origin as a fraction of the field's extent,
   * clamped to 0-1. The product stands at the origin, so this is what lets
   * relief rise with distance and leave the product's own patch of floor flat.
   */
  falloff: number
  /**
   * 0 where the product is standing, easing to 1 clear of it. Multiplies
   * anything that would lift a tile off the floor.
   *
   * `falloff` above is not a substitute — see `clearance.ts`, which explains
   * why, and `clearanceRadiusFor`, which supplies the radius.
   */
  clearance: number
}

/**
 * Hard ceiling on the instances in one field.
 *
 * The minimum pitch at the maximum extent asks for roughly 180,000 tiles. The
 * cap is what turns that from a locked-up tab into a field that simply stops
 * short — a knob a user can drag has to be safe across its whole range, not
 * only across the part anyone sensible would use.
 */
export const MAX_CELLS = 4096

/**
 * The finest pitch that still fits inside `MAX_CELLS` over a given area.
 *
 * The cap alone is not enough. Both generators fill row by row and stop the
 * instant they hit it, so truncation lands as a slice off one edge rather than
 * a field that thins out evenly — at the extremes of the two sliders that
 * feed it, most of the field simply is not drawn, and the room spends its
 * whole budget on the floor and renders no walls at all.
 *
 * Coarsening instead of truncating keeps the shape complete. A field asked for
 * more tiles than it can have gets bigger tiles, which is a change a user can
 * see and understand, rather than a hole they cannot.
 *
 * `area` is the ground the field has to cover and `perCell` the area one cell
 * occupies at unit pitch — 1 for squares, and sqrt(3)/2 for hexagons, which
 * tile more densely for the same centre-to-centre spacing.
 */
export function fitPitch(pitch: number, area: number, perCell = 1): number {
  // A little headroom: the loops run edge to edge inclusive, so they overshoot
  // the area estimate by a row and a column.
  const budget = MAX_CELLS * 0.85
  const minimum = Math.sqrt(area / (perCell * budget))
  return Math.max(pitch, minimum)
}

/**
 * Fewest rings of tiles a field needs before it stops reading as a field.
 *
 * Nothing stops the tile-size slider being set larger than the field itself,
 * and when it is, the lattice generates a single cell at the origin — which
 * the product's own clearance then flattens, so the environment renders
 * literally nothing and the control appears dead. Coarsening for the instance
 * budget is a ceiling on detail; this is the floor.
 */
const MIN_RINGS = 4

/** The pitch a field can actually use: never so coarse that the field is one
 *  tile hidden underneath the product. */
export const cappedPitch = (pitch: number, extent: number): number =>
  Math.min(pitch, extent / MIN_RINGS)

/** Area one hexagon covers at unit pitch, relative to a square's. */
export const HEX_DENSITY = Math.sqrt(3) / 2

/**
 * Circumradius of a hexagon whose centre-to-centre spacing is `pitch`.
 *
 * three.js builds a six-segment cylinder with its first vertex on +Z, so the
 * hexagon points along Z and turns flat edges towards X. Neighbours along X
 * are therefore `sqrt(3) * r` apart, and that spacing is what `pitch` means
 * for every kind — one knob that behaves the same on squares and hexagons.
 */
export const hexRadius = (pitch: number): number => pitch / ROOT3

/** Adds a cell if it falls inside the field's circular boundary. */
function collect(
  cells: Cell[],
  x: number,
  z: number,
  extent: number,
  clear: number,
): void {
  const radius = Math.hypot(x, z)
  if (radius > extent) return
  cells.push({
    x,
    z,
    falloff: Math.min(1, radius / extent),
    clearance: clearanceAt(radius, clear),
  })
}

/** Square lattice on a circular footprint, ordered outward from the centre. */
export function squareLattice(extent: number, pitch: number, clear = 0): Cell[] {
  const cells: Cell[] = []
  const steps = Math.ceil(extent / Math.max(pitch, 0.01))

  for (let iz = -steps; iz <= steps; iz += 1) {
    for (let ix = -steps; ix <= steps; ix += 1) {
      if (cells.length >= MAX_CELLS) return cells
      collect(cells, ix * pitch, iz * pitch, extent, clear)
    }
  }
  return cells
}

/**
 * Pointy-top hexagonal lattice on the same circular footprint.
 *
 * Rows are `1.5 * r` apart rather than `2 * r` because a hexagon row nests
 * into the notches of the one before it, and every other row is offset by half
 * a pitch to do so. Getting either wrong leaves visible seams or overlaps —
 * the two failure modes look quite different and both read as "broken tiling".
 */
export function hexLattice(extent: number, pitch: number, clear = 0): Cell[] {
  const cells: Cell[] = []
  const rowStep = pitch * (ROOT3 / 2)
  const rows = Math.ceil(extent / Math.max(rowStep, 0.01))

  for (let row = -rows; row <= rows; row += 1) {
    const z = row * rowStep
    const offset = row % 2 === 0 ? 0 : pitch / 2
    const columns = Math.ceil(extent / Math.max(pitch, 0.01)) + 1

    for (let column = -columns; column <= columns; column += 1) {
      if (cells.length >= MAX_CELLS) return cells
      collect(cells, column * pitch + offset, z, extent, clear)
    }
  }
  return cells
}
