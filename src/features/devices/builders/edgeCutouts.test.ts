import { describe, expect, it } from 'vitest'
import { buildEdgeCutouts } from './edgeCutouts'
import { DEVICES } from '../spec/registry'
import type { BodySpec } from '../spec/types'

/**
 * Rail cutouts are placed by a switch over four sides, each with its own
 * rotation and its own sign — the exact shape of code that looks right and puts
 * the speaker grille on the wrong edge. Worse, they are invisible from every
 * camera preset in the app: none of the nine looks at a phone's bottom rail, so
 * a cutout floating a centimetre off the body, or sunk inside it, would never
 * show up in a screenshot review.
 *
 * So the placement is checked arithmetically instead. The numbers below are
 * written out rather than imported from the module — importing `LIFT` would
 * make the assertion move with the bug.
 */

const body: BodySpec = {
  width: 70,
  height: 146,
  depth: 8,
  cornerRadius: 12,
  cornerSmoothing: 4,
  edgeRadius: 1.5,
}

/** How far proud of the rail a cutout sits. Restated from `edgeCutouts.ts`. */
const LIFT = 0.06

describe('rail cutouts', () => {
  it('puts a bottom-rail port on the bottom rail', () => {
    const [port] = buildEdgeCutouts(body, [
      { side: 'bottom', offset: 0, length: 8.7, across: 3.2, kind: 'slot' },
    ])

    expect(port?.position[0]).toBe(0)
    expect(port?.position[1]).toBeCloseTo(-(146 / 2 + LIFT), 6)
    expect(port?.position[2]).toBe(0)
  })

  it.each([
    ['top', 1, 146 / 2],
    ['bottom', 1, -(146 / 2)],
    ['left', 0, -(70 / 2)],
    ['right', 0, 70 / 2],
  ] as const)('lands a %s cutout on that rail and no other', (side, axis, edge) => {
    const [cutout] = buildEdgeCutouts(body, [
      { side, offset: 4, length: 3, kind: 'hole' },
    ])
    const position = cutout?.position ?? [0, 0, 0]

    // Proud of the rail by the lift, on the correct side of the body.
    expect(Math.abs(position[axis])).toBeCloseTo(Math.abs(edge) + LIFT, 6)
    expect(Math.sign(position[axis])).toBe(Math.sign(edge))

    // The other in-plane axis carries the offset along the rail.
    expect(position[axis === 1 ? 0 : 1]).toBe(4)
    // Nothing is ever displaced through the device's thickness.
    expect(position[2]).toBe(0)
  })

  it('spreads a grille evenly and keeps every hole inside its span', () => {
    const holes = buildEdgeCutouts(body, [
      { side: 'bottom', offset: 20, length: 13, kind: 'grille', count: 5 },
    ])
    expect(holes).toHaveLength(5)

    const xs = holes.map((hole) => hole.position[0])
    for (const x of xs) {
      expect(x).toBeGreaterThanOrEqual(20 - 13 / 2)
      expect(x).toBeLessThanOrEqual(20 + 13 / 2)
    }

    // Evenly spaced, and centred on the offset the spec asked for.
    const gaps = xs.slice(1).map((x, i) => x - (xs[i] ?? 0))
    for (const gap of gaps) expect(gap).toBeCloseTo(13 / 5, 6)
    expect((xs[0] ?? 0) + (xs.at(-1) ?? 0)).toBeCloseTo(40, 6)
  })

  it('keeps every catalogue cutout within the rail it is on', () => {
    // A port longer than its rail, or offset past the corner, would poke out
    // into space. Cheap to state, and it covers every device at once.
    for (const spec of DEVICES) {
      for (const cutout of spec.edges ?? []) {
        const along =
          cutout.side === 'left' || cutout.side === 'right'
            ? spec.body.height
            : spec.body.width
        const reach = Math.abs(cutout.offset) + cutout.length / 2
        expect(reach, `${spec.name} ${cutout.side} cutout`).toBeLessThan(along / 2)
      }
    }
  })
})
