import { ShapeGeometry } from 'three'
import { squircleShape } from './shape'
import type { BodySpec, EdgeCutoutSpec } from '../spec/types'

/**
 * Ports, microphones and speaker grilles on a device's rails.
 *
 * A bottom edge with nothing on it is the quietest tell that a render is
 * generated: nobody looks at a phone and thinks "speaker holes", but everybody
 * notices their absence without being able to name it.
 *
 * Drawn as flat dark shapes sitting a hair proud of the rail rather than as
 * geometry cut into it. At the size these occupy on screen — a USB-C port is
 * about eight millimetres on a seventy-millimetre rail — a boolean subtraction
 * would cost a mesh rebuild per device and look identical. What sells a hole at
 * this scale is that it is dark and does not move with the rail's highlight,
 * which a flat unlit shape does for free.
 */

export interface EdgePlacement {
  geometry: ShapeGeometry
  position: [number, number, number]
}

/** How far proud of the rail the shape sits, in millimetres. Enough to clear
 *  the rail's own chamfer without reading as a raised sticker. */
const LIFT = 0.06

/** Across the rail, when the spec does not say: most of the body's depth. */
const ACROSS_SHARE = 0.34

export function buildEdgeCutouts(
  body: BodySpec,
  cutouts: readonly EdgeCutoutSpec[],
): EdgePlacement[] {
  return cutouts.flatMap((cutout) => holesFor(body, cutout))
}

/** A grille is a row of round holes; everything else is a single shape. */
function holesFor(body: BodySpec, cutout: EdgeCutoutSpec): EdgePlacement[] {
  if (cutout.kind !== 'grille') return [place(body, cutout, cutout.offset, cutout.length)]

  const count = Math.max(2, Math.round(cutout.count ?? 6))
  const pitch = cutout.length / count
  const start = cutout.offset - cutout.length / 2 + pitch / 2

  return Array.from({ length: count }, (_, i) =>
    // Each hole is round, so its length is its own diameter rather than the
    // grille's total span — the span is what sets the spacing.
    place(body, cutout, start + i * pitch, pitch * 0.55),
  )
}

function place(
  body: BodySpec,
  cutout: EdgeCutoutSpec,
  offset: number,
  length: number,
): EdgePlacement {
  const across = cutout.across ?? Math.min(body.depth * ACROSS_SHARE, length)
  const onSideRail = cutout.side === 'left' || cutout.side === 'right'

  const shape = squircleShape({
    width: onSideRail ? across : length,
    height: onSideRail ? length : across,
    // A slot is a pill, a hole and a grille dot are circles.
    radius: cutout.kind === 'slot' ? across / 2 : Math.min(length, across) / 2,
    exponent: cutout.kind === 'slot' ? 3 : 2,
    segments: 8,
  })

  const geometry = new ShapeGeometry(shape)

  switch (cutout.side) {
    case 'bottom':
      geometry.rotateX(Math.PI / 2)
      return { geometry, position: [offset, -(body.height / 2 + LIFT), 0] }
    case 'top':
      geometry.rotateX(-Math.PI / 2)
      return { geometry, position: [offset, body.height / 2 + LIFT, 0] }
    case 'right':
      geometry.rotateY(Math.PI / 2)
      return { geometry, position: [body.width / 2 + LIFT, offset, 0] }
    case 'left':
      geometry.rotateY(-Math.PI / 2)
      return { geometry, position: [-(body.width / 2 + LIFT), offset, 0] }
  }
}
