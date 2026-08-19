import { Shape } from 'three'
import { squirclePoints, type SquircleOptions } from '@/lib/math/squircle'
import type { BufferGeometry } from 'three'

/** Bridges the pure squircle maths into a three.js Shape. */
export function squircleShape(options: SquircleOptions): Shape {
  const shape = new Shape()
  const points = squirclePoints(options)

  points.forEach(([x, y], index) => {
    if (index === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  })
  shape.closePath()

  return shape
}

/**
 * Rewrites UVs to span 0-1 across the geometry's bounding box.
 *
 * ShapeGeometry emits UVs in the shape's own coordinate units, which for a
 * 70mm-wide screen means UVs in the tens — a screenshot mapped with those would
 * tile into confetti. Every surface that carries an image needs this.
 */
export function normalizeUv(geometry: BufferGeometry): BufferGeometry {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  if (!box || !uv) return geometry

  const width = box.max.x - box.min.x || 1
  const height = box.max.y - box.min.y || 1

  for (let i = 0; i < position.count; i += 1) {
    uv.setXY(
      i,
      (position.getX(i) - box.min.x) / width,
      (position.getY(i) - box.min.y) / height,
    )
  }
  uv.needsUpdate = true

  return geometry
}
