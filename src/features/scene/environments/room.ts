import { hash2 } from '@/features/textures'
import { MAX_CELLS, fitPitch } from './lattice'
import type { Placement } from './instances'
import type { StructureConfig } from './schema'

/**
 * Tile placements for the built room: a floor and four walls, every tile a
 * single-sided plane whose front face points *into* the room.
 *
 * That last detail is the whole design, and it is inherited from the bug the
 * cyclorama had (see `backdrop/cycloramaGeometry.ts`). A room built from solid
 * boxes occludes the product the moment the camera orbits or zooms outside it
 * — which it will, since `maxDistance` reaches far past any sensible extent,
 * and since a large device is framed from further back than a phone. Planes
 * facing inward are back-face culled from outside, so a camera that leaves the
 * room simply sees straight through it. Relief therefore comes from each
 * tile's inward offset and its normal map, never from extrusion.
 */

/** One face of the room: where its tiles sit and which way they look. */
interface Surface {
  /** Euler angles that turn a plane's default +Z normal into this face's. */
  rotation: readonly [number, number, number]
  /** Maps grid coordinates (across, up) to a world position. */
  at: (across: number, up: number) => readonly [number, number, number]
  /** Unit normal, pointing into the room. */
  normal: readonly [number, number, number]
  /** Half-width across, and full height up. */
  half: number
  height: number
  /** Whether the "up" axis is centred on zero (the floor) or starts at it. */
  centred: boolean
}

function surfaces(config: StructureConfig): Surface[] {
  const e = config.extent
  const h = config.wallHeight
  const quarter = Math.PI / 2

  return [
    {
      rotation: [-quarter, 0, 0],
      at: (u, v) => [u, 0, v],
      normal: [0, 1, 0],
      half: e,
      height: e,
      centred: true,
    },
    {
      rotation: [0, 0, 0],
      at: (u, v) => [u, v, -e],
      normal: [0, 0, 1],
      half: e,
      height: h,
      centred: false,
    },
    {
      rotation: [0, Math.PI, 0],
      at: (u, v) => [u, v, e],
      normal: [0, 0, -1],
      half: e,
      height: h,
      centred: false,
    },
    {
      rotation: [0, quarter, 0],
      at: (u, v) => [-e, v, u],
      normal: [1, 0, 0],
      half: e,
      height: h,
      centred: false,
    },
    {
      rotation: [0, -quarter, 0],
      at: (u, v) => [e, v, u],
      normal: [-1, 0, 0],
      half: e,
      height: h,
      centred: false,
    },
  ]
}

/**
 * The pitch the room actually tiles at.
 *
 * Sized against the floor *and* all four walls together, because the budget is
 * shared between them and the floor is laid first. Fitting only the floor
 * would let it eat the whole allowance and leave the room with no walls, which
 * is precisely the failure this exists to prevent.
 */
export function roomPitch(config: StructureConfig): number {
  const e = config.extent
  const area = 4 * e * e + 8 * e * config.wallHeight
  let pitch = fitPitch(config.pitch, area)

  // The area estimate undercounts, because every surface runs edge to edge
  // inclusive and so gains a row and a column over its bare area. Counting
  // exactly and coarsening until it fits beats padding the estimate with a
  // fudge factor that would have to be re-guessed whenever a loop bound moves.
  for (let step = 0; step < 32 && tileCount(config, pitch) > MAX_CELLS; step += 1) {
    pitch *= 1.06
  }
  return pitch
}

/** Exactly what `fillSurface` will produce for all five faces at `pitch`. */
function tileCount(config: StructureConfig, pitch: number): number {
  const across = 2 * Math.ceil(config.extent / Math.max(pitch, 0.01)) + 1
  const floor = (2 * Math.ceil(config.extent / Math.max(pitch, 0.01)) + 1) * across
  const wall = (Math.ceil(config.wallHeight / Math.max(pitch, 0.01)) + 1) * across
  return floor + 4 * wall
}

/**
 * Every tile in the room. `MAX_CELLS` remains as a hard backstop, but
 * `roomPitch` should keep the count under it, so the cap no longer decides
 * which surfaces get drawn.
 */
export function roomTiles(config: StructureConfig): Placement[] {
  const tiles: Placement[] = []
  const pitch = roomPitch(config)
  for (const surface of surfaces(config)) {
    if (!fillSurface(tiles, surface, config, pitch)) break
  }
  return tiles
}

/** Returns false once the global cap is reached, so the caller stops. */
function fillSurface(
  tiles: Placement[],
  surface: Surface,
  config: StructureConfig,
  fitted: number,
): boolean {
  const pitch = Math.max(fitted, 0.01)
  const columns = Math.ceil(surface.half / pitch)
  const rows = Math.ceil(surface.height / pitch)
  const first = surface.centred ? -rows : 0

  for (let row = first; row <= rows; row += 1) {
    for (let column = -columns; column <= columns; column += 1) {
      if (tiles.length >= MAX_CELLS) return false
      tiles.push(tile(surface, config, column * pitch, row * pitch, column, row))
    }
  }
  return true
}

function tile(
  surface: Surface,
  config: StructureConfig,
  across: number,
  up: number,
  column: number,
  row: number,
): Placement {
  // A deterministic per-tile lift, so the wall reads as laid rather than
  // printed. Seeded, so a saved preset lays exactly the same room again.
  const lift = hash2(column, row, config.seed) * config.relief * config.depth
  const [x, y, z] = surface.at(across, up)
  const [nx, ny, nz] = surface.normal

  return {
    position: [x + nx * lift, y + ny * lift, z + nz * lift],
    rotation: surface.rotation,
    // Height up a wall drives the tint, which is what gives the room its
    // sense of a light source above rather than flat paint.
    tint: Math.min(1, Math.max(0, up / Math.max(config.wallHeight, 0.01))),
  }
}
