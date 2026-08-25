import { useMemo } from 'react'
import { mix } from '@/lib/color/hex'
import { buildEdgeCutouts } from '../builders/edgeCutouts'
import type { DeviceSpec } from '../spec/types'

export interface EdgeDetailsProps {
  spec: DeviceSpec
  frameColor: string
}

/**
 * Ports, microphones and speaker grilles along the rails.
 *
 * Unlit on purpose. A hole has no surface to catch the key light, so a lit
 * material would brighten with the rail as the camera moves and read as a
 * printed dot; `meshBasicMaterial` stays the same shade from every angle, which
 * is what a shadowed recess actually does at this size.
 *
 * Derived from the rail's own colour rather than a fixed dark grey, so a
 * titanium phone and a white one both get a hole that belongs to them.
 */
export function EdgeDetails({ spec, frameColor }: EdgeDetailsProps) {
  const placements = useMemo(
    () => (spec.edges ? buildEdgeCutouts(spec.body, spec.edges) : []),
    [spec.edges, spec.body],
  )

  if (placements.length === 0) return null

  const ink = mix(frameColor, '#000000', 0.78)

  return (
    <group>
      {placements.map((placement, index) => (
        <mesh
          key={index}
          geometry={placement.geometry}
          position={placement.position}
          renderOrder={1}
        >
          <meshBasicMaterial color={ink} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
