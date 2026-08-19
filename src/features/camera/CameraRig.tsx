import { useEffect, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { MOUSE, PerspectiveCamera, TOUCH } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useAppStore } from '@/state/store'

/** Editor-style bindings: orbit with left, pan with middle or right, wheel zooms. */
const MOUSE_BUTTONS = {
  LEFT: MOUSE.ROTATE,
  MIDDLE: MOUSE.PAN,
  RIGHT: MOUSE.PAN,
} as const

const TOUCHES = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN } as const

/**
 * Viewport navigation, in the vein of a 3D editor.
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
  const canvas = useThree((state) => state.gl.domElement)

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

  // Right-drag pans, so the browser's context menu has to stay out of the way.
  useEffect(() => {
    const suppress = (event: MouseEvent) => event.preventDefault()
    canvas.addEventListener('contextmenu', suppress)
    return () => canvas.removeEventListener('contextmenu', suppress)
  }, [canvas])

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={camera.damping}
      enablePan={camera.enablePan}
      enableZoom={camera.enableZoom}
      enableRotate={camera.enableRotate}
      rotateSpeed={camera.rotateSpeed}
      panSpeed={camera.panSpeed}
      zoomSpeed={camera.zoomSpeed}
      // Editor-style panning moves across the view plane rather than along the
      // ground, which is what makes dragging feel like Blender or Unity.
      screenSpacePanning={camera.screenSpacePanning}
      minDistance={camera.minDistance}
      maxDistance={camera.maxDistance}
      autoRotate={camera.autoRotate}
      autoRotateSpeed={camera.autoRotateSpeed}
      // Orbiting under the floor is allowed, but off by default: it puts the
      // product upside down under its own pedestal, which is rarely intended.
      maxPolarAngle={camera.orbitBelowFloor ? Math.PI : Math.PI * 0.5}
      mouseButtons={MOUSE_BUTTONS}
      touches={TOUCHES}
    />
  )
}
