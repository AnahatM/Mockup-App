import { useLayoutEffect, useRef } from 'react'
import type { Group } from 'three'
import { useAppStore } from '@/state/store'
import { LightGizmo } from './LightGizmo'
import { registerGizmoGroup } from './gizmoCaptureGuard'

/**
 * Editing-time markers for every light — an icon at each light's position,
 * tinted to its colour, with a short arrow showing which way it points.
 *
 * This replaces the earlier wireframe boxes that traced the light panel's
 * own geometry: those looked like the light itself rather than a marker for
 * it, and this is what the toolbar's "light markers" toggle now renders
 * instead (`ui.showLightGizmos`, read here but owned by `state/slices/ui.ts`).
 *
 * The group is registered with `gizmoCaptureGuard` so `capturePng`/`recordWebm`
 * can force it invisible for the duration of an export — see that module for
 * why a store flag is not safe enough on its own.
 */
export function LightGizmos() {
  const lights = useAppStore((state) => state.lighting.lights)
  const visible = useAppStore((state) => state.ui.showLightGizmos)
  const groupRef = useRef<Group>(null)

  useLayoutEffect(() => {
    registerGizmoGroup(groupRef.current)
    return () => registerGizmoGroup(null)
  }, [visible])

  if (!visible) return null

  return (
    <group ref={groupRef}>
      {lights.map((light) => (
        <LightGizmo key={light.id} light={light} />
      ))}
    </group>
  )
}
