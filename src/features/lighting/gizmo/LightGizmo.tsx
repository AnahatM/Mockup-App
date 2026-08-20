import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Quaternion, Vector3 } from 'three'
import type { Group } from 'three'
import { useAppStore } from '@/state/store'
import type { LightConfig } from '../schema'
import { gizmoScaleForDistance, lightDirection } from './gizmoMath'
import { getLightIconTexture } from './lightIcon'

/** Icon target size, in screen pixels, regardless of camera distance. */
const ICON_PIXELS = 26
const UP = new Vector3(0, 1, 0)

/**
 * One light's marker: a colour-tinted icon sprite plus a short arrow along
 * the direction it points. Never the light panel itself — see LightRig for
 * the actual (hidden) geometry.
 */
export function LightGizmo({ light }: { light: LightConfig }) {
  const groupRef = useRef<Group>(null)
  const selected = useAppStore((s) => s.selectedLightId === light.id)
  const selectLight = useAppStore((s) => s.selectLight)
  const icon = useMemo(() => getLightIconTexture(), [])
  const direction = useMemo(() => lightDirection(light), [light])
  const arrowQuat = useMemo(() => arrowQuaternion(direction), [direction])
  const worldPos = useMemo(() => new Vector3(...light.position), [light.position])

  useFrame(({ camera, size }) => {
    const group = groupRef.current
    if (!group || !(camera instanceof PerspectiveCamera)) return
    const distance = camera.position.distanceTo(worldPos)
    group.scale.setScalar(gizmoScaleForDistance(distance, camera.fov, size.height, ICON_PIXELS))
  })

  const tint = light.enabled ? light.color : '#7a7f8a'
  const opacity = light.enabled ? 1 : 0.45

  return (
    <group ref={groupRef} position={light.position}>
      {/*
        A generous, invisible hit target so the small icon is easy to click.
        Made invisible with zero opacity rather than `visible={false}`, since
        an invisible object is not guaranteed to still be pickable.
      */}
      <mesh
        onClick={(event) => {
          event.stopPropagation()
          selectLight(light.id)
        }}
      >
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <sprite renderOrder={999}>
        <spriteMaterial
          map={icon}
          color={tint}
          opacity={opacity}
          transparent
          depthTest={false}
          toneMapped={false}
        />
      </sprite>

      <group quaternion={arrowQuat}>
        <mesh position={[0, 0.9, 0]} renderOrder={999}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
          <meshBasicMaterial color={tint} transparent opacity={opacity} depthTest={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 1.55, 0]} renderOrder={999}>
          <coneGeometry args={[0.09, 0.3, 10]} />
          <meshBasicMaterial color={tint} transparent opacity={opacity} depthTest={false} toneMapped={false} />
        </mesh>
      </group>

      {selected && (
        <mesh renderOrder={998}>
          <ringGeometry args={[0.34, 0.42, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} depthTest={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}

/** Cone/cylinder geometry points along +Y by default; rotate it onto `direction`. */
function arrowQuaternion(direction: readonly [number, number, number]): Quaternion {
  const dir = new Vector3(...direction)
  if (dir.lengthSq() < 1e-8) return new Quaternion()
  return new Quaternion().setFromUnitVectors(UP, dir.normalize())
}
