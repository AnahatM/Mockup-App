import { useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useAppStore } from '@/state/store'

/**
 * Orbit controls bound to the camera store.
 *
 * The user dragging the view is treated as transient: it is not written back to
 * the store on every frame (which would thrash the inspector and the undo
 * history). The store is the *authored* camera; presets and animation write to
 * it, and `makeDefault` lets everything else read the live one.
 */
export function CameraRig() {
  const camera = useAppStore((state) => state.camera)
  const controls = useRef<OrbitControlsImpl>(null)

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={camera.target}
      enableDamping
      dampingFactor={camera.damping}
      enablePan={camera.enablePan}
      minDistance={camera.minDistance}
      maxDistance={camera.maxDistance}
      autoRotate={camera.autoRotate}
      autoRotateSpeed={camera.autoRotateSpeed}
      // Keep the product above the floor plane; orbiting underneath a pedestal
      // looks broken rather than creative.
      maxPolarAngle={Math.PI * 0.52}
    />
  )
}
