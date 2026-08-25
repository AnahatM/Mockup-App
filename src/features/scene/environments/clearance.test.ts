import { describe, expect, it } from 'vitest'
import {
  DEVICES,
  clearanceRadiusFor,
  defaultDeviceConfig,
  productHeightFor,
  resolveDevice,
} from '@/features/devices/state'
import { clearanceAt } from './clearance'
import { blockRise, fieldOffsetY, placer, tileHeight } from './field'
import { cappedPitch, hexLattice, squareLattice } from './lattice'
import type { Placement } from './instances'
import { roomTiles } from './room'
import { structureSchema, type StructureConfig } from './schema'

/**
 * The product stands at the origin, on the floor, with its feet at y=0. A
 * backdrop structure is laid across that same floor, and for several releases
 * nothing in it knew the device was there: the pulsating block field lifted
 * the block at the origin by up to three world units, straight up through
 * whatever was standing on it.
 *
 * These hold the exclusion. The numbers below are restated rather than
 * imported — importing `CLEARANCE_RAMP` or a config default would make each
 * assertion move with the bug it is meant to catch, which is the lesson from
 * ADR 0008.
 */

const config = (overrides: Partial<StructureConfig> = {}): StructureConfig =>
  structureSchema.parse(overrides)

/**
 * Every device in the catalogue, by the radius it claims. Testing one made-up
 * number was the first version of this file and it proved almost nothing: at
 * the default pitch a phone's clearance contains exactly one cell, the one at
 * the origin, which the field's own radial falloff already holds flat. The
 * relief bug only shows on a device big enough to cover several cells — a
 * monitor claims about 3 units against a phone's 0.36 — so the catalogue is
 * the input, not a constant.
 */
const CLEARANCES = DEVICES.map((spec) => ({
  name: spec.name,
  clear: clearanceRadiusFor(spec),
}))

/** The largest device in the catalogue, where a whole neighbourhood of cells
 *  falls inside the exclusion. */
const CLEAR = Math.max(...CLEARANCES.map((entry) => entry.clear))

/** Sampled across a full 4-second cycle at the default speed of 0.25 Hz. */
const TIMES = Array.from({ length: 41 }, (_, i) => i * 0.1)

/**
 * The highest point of any tile whose centre falls inside `clear`, in world
 * space — where y=0 is the floor the device's feet are on.
 *
 * `fieldOffsetY` is the same function the component positions the field with,
 * so this measures the geometry the scene actually draws rather than a
 * restatement of it that could quietly drift. It is the one number here that
 * is imported rather than written out: everything the tests are *asserting*
 * stays a literal, but where the field is standing is an input.
 */
function highestUnderProduct(cfg: StructureConfig, clear: number): number {
  const cells = squareLattice(cfg.extent, cfg.pitch, clear)
  const heights = cells.map((cell) => tileHeight(cell, cfg))
  const place = placer(cells, heights, cfg)

  let peak = -Infinity
  for (const time of TIMES) {
    cells.forEach((cell, index) => {
      if (Math.hypot(cell.x, cell.z) > clear) return
      const { position, scale } = place(index, time)
      peak = Math.max(peak, position[1] + (scale?.[1] ?? 1) / 2 + fieldOffsetY(cfg))
    })
  }
  return peak
}

describe('structures keep clear of the product', () => {
  it.each(CLEARANCES)(
    'never lifts a pulsating block through $name',
    ({ clear }) => {
      const blocks = config({ kind: 'blocks', pulse: 3, depth: 3, relief: 1 })
      expect(highestUnderProduct(blocks, clear)).toBeLessThanOrEqual(0)
    },
  )

  it.each(CLEARANCES)('holds a relief-heavy tile field flat under $name', ({ clear }) => {
    const tiles = config({ kind: 'tiles', depth: 3, relief: 1 })
    expect(highestUnderProduct(tiles, clear)).toBeLessThanOrEqual(0)
  })

  it('would lift one if the field did not know the device was there', () => {
    /*
     * The other half of the guard. Asking for zero clearance is what the field
     * effectively did before this existed, and it must still produce the
     * intrusion — otherwise the assertion above passes for some unrelated
     * reason and stops testing anything. Verified by deleting the `clearance`
     * factor from `blockRise`, which makes the test above fail and this one
     * pass unchanged.
     */
    const blocks = config({ kind: 'blocks', pulse: 3, depth: 3, relief: 1 })
    expect(highestUnderProduct(blocks, 0)).toBeGreaterThan(1)
  })

  it('holds the hex field flat too', () => {
    const cfg = config({ kind: 'hex', depth: 3, relief: 1 })
    const cells = hexLattice(cfg.extent, cfg.pitch, CLEAR)
    const inside = cells.filter((cell) => Math.hypot(cell.x, cell.z) <= CLEAR)

    // Several dozen, not one — see the note on CLEARANCES.
    expect(inside.length).toBeGreaterThan(20)
    for (const cell of inside) expect(tileHeight(cell, cfg)).toBe(cfg.depth)
  })

  it('holds the room floor down under the product but not its walls', () => {
    const cfg = config({ kind: 'room', depth: 3, relief: 1 })
    const tiles = roomTiles(cfg, CLEAR)

    // The floor is the only surface whose tiles are pitched about X; the four
    // walls stand upright and are rotated about Y or not at all.
    const isFloor = (tile: Placement): boolean => (tile.rotation?.[0] ?? 0) !== 0
    const underProduct = (tile: Placement): boolean =>
      Math.hypot(tile.position[0], tile.position[2]) <= CLEAR

    const floor = tiles.filter((tile) => isFloor(tile) && underProduct(tile))
    expect(floor.length).toBeGreaterThan(0)
    for (const tile of floor) expect(tile.position[1]).toBe(0)

    // The walls are nowhere near the product and keep their full laid lift,
    // which is what stops this passing by flattening the whole room.
    const walls = tiles.filter((tile) => !isFloor(tile))
    expect(walls.some((tile) => tile.position[2] > -cfg.extent)).toBe(true)
  })

  it.each(DEVICES.map((spec) => ({ name: spec.name, spec })))(
    'never builds a structure taller than $name',
    ({ spec }) => {
      /*
       * At the top of the depth, relief and pulse sliders together the field
       * came out fifteen units tall against a phone's one and a half: the
       * camera ended up inside a block and the viewport went flat grey.
       * Nothing failed — it rendered, it animated, it was simply not a scene.
       *
       * A backdrop is behind the product by definition. It may reach the
       * product's own height and no further.
       */
      const ceiling = productHeightFor(spec)
      const cfg = config({ kind: 'blocks', depth: 3, relief: 1, pulse: 3 })
      const cells = squareLattice(cfg.extent, cfg.pitch, clearanceRadiusFor(spec))

      let tallest = 0
      for (const time of TIMES) {
        cells.forEach((cell) => {
          const rest = tileHeight(cell, cfg, ceiling)
          tallest = Math.max(tallest, rest + blockRise(cell, cfg, time, ceiling))
        })
      }
      expect(tallest).toBeLessThanOrEqual(ceiling)
    },
  )

  it('leaves the shipped default look completely alone', () => {
    /*
     * A cap nobody asked for that quietly flattens the defaults would be a
     * worse bug than the one it fixes. So: on the device the app opens with,
     * at the structure settings it opens with, nothing the ceiling does may
     * change a single tile.
     *
     * Deliberately the default device rather than every device. A watch is
     * about a third of a phone's height and its field is genuinely shorter —
     * that is the rule working, not an exception to it.
     */
    const cfg = config({ kind: 'blocks' })
    const ceiling = productHeightFor(resolveDevice(defaultDeviceConfig().specId))
    const cells = squareLattice(cfg.extent, cfg.pitch, CLEAR)

    for (const cell of cells) {
      expect(tileHeight(cell, cfg, ceiling)).toBe(tileHeight(cell, cfg))
      expect(blockRise(cell, cfg, 1.3, ceiling)).toBe(blockRise(cell, cfg, 1.3))
    }
  })

  it('eases back to full height instead of cutting a crater', () => {
    // Hard edges read as a bug of their own, so the ramp is part of the
    // contract: nothing at the rim, everything by 2.2x out, and monotonic
    // in between.
    expect(clearanceAt(CLEAR, CLEAR)).toBe(0)
    expect(clearanceAt(CLEAR * 2.2, CLEAR)).toBe(1)
    expect(clearanceAt(CLEAR * 1.6, CLEAR)).toBeCloseTo(0.5, 2)

    const samples = Array.from({ length: 20 }, (_, i) => clearanceAt(i * 0.1, CLEAR))
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i] ?? 0).toBeGreaterThanOrEqual(samples[i - 1] ?? 0)
    }
  })
})

describe('a field always has a field in it', () => {
  it('lays several rings even when the tile is set larger than the field', () => {
    /*
     * `Tile size` and `Size` are independent sliders, so nothing stops the
     * tile being bigger than the field it tiles. At pitch 3 across an extent
     * of 2 the lattice produced exactly one cell, at the origin, which the
     * product's clearance then flattened — so the environment drew nothing at
     * all and the control looked broken.
     */
    const extent = 2
    const coarse = cappedPitch(3, extent)
    expect(squareLattice(extent, coarse).length).toBeGreaterThan(8)
    expect(hexLattice(extent, coarse).length).toBeGreaterThan(8)
  })

  it('leaves a sensible pitch alone', () => {
    // The cap is a floor on detail, not a redesign of the default look.
    expect(cappedPitch(0.55, 8)).toBe(0.55)
  })
})
