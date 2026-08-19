import { useMemo } from 'react'
import { ShapeGeometry } from 'three'
import { squircleShape } from '../builders/shape'
import type { CutoutSpec, DeviceSpec } from '../spec/types'

export interface ScreenCutoutProps {
  spec: DeviceSpec
  cutout: CutoutSpec
  z: number
}

/**
 * Dynamic Island, notch or punch-hole.
 *
 * Rendered as an unlit black overlay sitting just in front of the screen rather
 * than as a hole in the geometry. That keeps it independently toggleable and
 * makes it work identically for a procedural device and an imported GLB.
 */
export function ScreenCutout({ spec, cutout, z }: ScreenCutoutProps) {
  const geometry = useMemo(() => buildCutout(spec, cutout), [spec, cutout])
  if (!geometry) return null

  return (
    <mesh geometry={geometry} position={[0, 0, z]} renderOrder={2}>
      <meshBasicMaterial color="#000000" toneMapped={false} />
    </mesh>
  )
}

function buildCutout(spec: DeviceSpec, cutout: CutoutSpec): ShapeGeometry | null {
  const topEdge = spec.body.height / 2 - spec.screen.inset

  switch (cutout.type) {
    case 'none':
      return null

    case 'island': {
      const geometry = new ShapeGeometry(
        squircleShape({
          width: cutout.width,
          height: cutout.height,
          radius: cutout.height / 2,
          exponent: 4,
          segments: 14,
        }),
      )
      geometry.translate(0, topEdge - cutout.top - cutout.height / 2, 0)
      return geometry
    }

    case 'punch-hole': {
      const geometry = new ShapeGeometry(
        squircleShape({
          width: cutout.diameter,
          height: cutout.diameter,
          radius: cutout.diameter / 2,
          exponent: 2,
          segments: 20,
        }),
      )
      geometry.translate(
        cutout.offsetX ?? 0,
        topEdge - cutout.top - cutout.diameter / 2,
        0,
      )
      return geometry
    }

    case 'notch': {
      // A notch hangs from the top edge, so only its lower corners are rounded.
      const geometry = new ShapeGeometry(
        squircleShape({
          width: cutout.width,
          height: cutout.height * 2,
          radius: Math.min(cutout.height, cutout.width / 4),
          exponent: 4,
          segments: 14,
        }),
      )
      geometry.translate(0, topEdge - cutout.height, 0)
      return geometry
    }
  }
}
