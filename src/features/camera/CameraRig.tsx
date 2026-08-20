import { useEffect, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { MOUSE, PerspectiveCamera, TOUCH } from 'three'
import type { Camera, Vector3 } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Vec3Tuple } from '@/lib/schema/primitives'
import { useAppStore } from '@/state/store'
import { FlyCamera } from './FlyCamera'
import { nearlyEqualVec3, wheelZoomFactor } from './navigate'
import { useSpacePan } from './useSpacePan'

/** Editor-style bindings: orbit with left, pan with middle or right, wheel zooms. */
const MOUSE_BUTTONS = {
  LEFT: MOUSE.ROTATE,
  MIDDLE: MOUSE.PAN,
  RIGHT: MOUSE.PAN,
} as const

const TOUCHES = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN } as const

/** Reads a live three.js vector into the plain tuple the store holds. */
const toTuple = (v: Vector3): Vec3Tuple => [v.x, v.y, v.z]

/** Whether an incoming authored view is just this camera's own committed
 *  position coming back round, rather than a real change to apply. */
function isEcho(
  live: Camera,
  controls: OrbitControlsImpl | null,
  position: Vec3Tuple,
  target: Vec3Tuple,
): boolean {
  if (!nearlyEqualVec3(toTuple(live.position), position)) return false
  return !controls || nearlyEqualVec3(toTuple(controls.target), target)
}

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
  const dollyCamera = useAppStore((state) => state.dollyCamera)
  const syncCameraView = useAppStore((state) => state.syncCameraView)
  const controls = useRef<OrbitControlsImpl>(null)
  const live = useThree((state) => state.camera)
  const canvas = useThree((state) => state.gl.domElement)

  // Fires only when the authored values change, since immer hands back new
  // arrays — so a user's manual orbit is never yanked back.
  useEffect(() => {
    // `syncCameraView` below sends the live view *into* the store, and that
    // comes straight back here as an authored change. Re-applying an echo of
    // the camera's own position would fight the damping still coasting after
    // the drag, so a value the camera is already at is left alone.
    if (!isEcho(live, controls.current, camera.position, camera.target)) {
      live.position.set(...camera.position)
      controls.current?.target.set(...camera.target)
    }
    if (live instanceof PerspectiveCamera) {
      live.fov = camera.fov
      live.updateProjectionMatrix()
    }
    controls.current?.update()
  }, [live, camera.position, camera.target, camera.fov])

  // Orbiting and panning deliberately move the live camera only. That was
  // fine until a zoom arrived: `dollyCamera` works from the *authored*
  // position, so it dollied along the pre-drag view ray and the camera
  // snapped back to whatever angle the store still remembered. Committing the
  // live view once per drag, on `end`, keeps the two in step — which is not
  // the same as the per-frame write the comment above warns against.
  useEffect(() => {
    const instance = controls.current
    if (camera.mode !== 'orbit' || !instance) return
    const commit = () => syncCameraView(toTuple(live.position), toTuple(instance.target))
    instance.addEventListener('end', commit)
    return () => instance.removeEventListener('end', commit)
  }, [camera.mode, live, syncCameraView])

  // Right-drag pans, so the browser's context menu has to stay out of the way.
  useEffect(() => {
    const suppress = (event: MouseEvent) => event.preventDefault()
    canvas.addEventListener('contextmenu', suppress)
    return () => canvas.removeEventListener('contextmenu', suppress)
  }, [canvas])

  // Replaces `OrbitControls`' own wheel handling (disabled below via
  // `enableZoom={false}`) with one implementation shared with the toolbar's
  // zoom buttons — see `wheelZoomFactor` for why a trackpad needs this to
  // feel proportional, not just to match the buttons.
  useEffect(() => {
    if (camera.mode !== 'orbit' || !camera.enableZoom) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      dollyCamera(wheelZoomFactor(event.deltaY, event.deltaMode, camera.zoomSpeed))
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [canvas, camera.mode, camera.enableZoom, camera.zoomSpeed, dollyCamera])

  // Hold Space or Shift and drag to pan — see `useSpacePan`. Called
  // unconditionally (hooks cannot be conditional); it is inert of its own
  // accord once `controls.current` is null, which is exactly the fly-mode case.
  useSpacePan(canvas, controls)

  // Fly mode replaces the orbit rig entirely; two sets of controls fighting over the
  // same camera produces jitter rather than a blend.
  if (camera.mode === 'fly') return <FlyCamera />

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={camera.damping}
      enablePan={camera.enablePan}
      // Zoom is handled by the wheel effect above instead, which is the
      // "Zoom" toggle's real gate now — see that effect.
      enableZoom={false}
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
