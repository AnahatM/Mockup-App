import { useEffect, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useAppStore } from '@/state/store'

/**
 * Orbit controls bound to the camera store.
 *
 * Dragging the view is treated as transient and is NOT written back to the store
 * on every frame — that would thrash the inspector and flood the undo history.
 * The store holds the *authored* camera: presets, device framing and animation
 * write to it, and the effect below pushes those changes onto the live camera.
 */
export function CameraRig() {
  const camera = useAppStore((state) => state.camera)
  const controls = useRef<OrbitControlsImpl>(null)
  const live = useThree((state) => state.camera)

  // Fires only when the authored values change, since immer hands back new
  // arrays — so a user's manual orbit is never yanked back.
  useEffect(() => {
    live.position.set(...camera.position)
    if (live instanceof PerspectiveCamera) {
      live.fov = camera.fov
      live.updateProjectionMatrix()
    }
    controls.current?.target.set(...camera.target)
    controls.current?.update()
  }, [live, camera.position, camera.target, camera.fov])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
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
