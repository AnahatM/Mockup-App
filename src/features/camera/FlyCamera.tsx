import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Euler } from 'three'
import type { Camera } from 'three'
import { useAppStore } from '@/state/store'
import {
  approachVelocity,
  clampPitch,
  targetVelocity,
  wheelDollyDistance,
} from './flyPhysics'
import { useFlyKeyboard } from './useFlyKeyboard'
import { useFlyLook } from './useFlyLook'
import type { Vec3Tuple } from '@/lib/schema/primitives'

/** Pixels of drag mapped to radians of rotation; `flyLook` (0.05-4) then
 *  scales this like a sensitivity dial. */
const LOOK_RADIANS_PER_PIXEL = 0.0025

/**
 * Free camera: WASD to move, Q/E for up and down (R/F also work), drag to look.
 *
 * Orbit controls always circle a target, which is right for inspecting a
 * product but means the camera can never leave that sphere — you cannot push
 * in past the pivot or fly around the room. This releases it.
 *
 * Movement and look are hand-rolled rather than drei's `FlyControls`: that
 * control drove rotation from the cursor's absolute *offset from the
 * viewport centre* while dragging, so the camera kept spinning for as long
 * as the pointer sat off-centre — even with a perfectly still hand. That is
 * what read as "drifting". Here look is a relative pointer delta (see
 * `useFlyLook`) and movement is a velocity damped toward the held keys (see
 * `flyPhysics`), so the camera comes to rest the instant input stops, on a
 * mouse or a trackpad alike.
 *
 * Scroll moves forward/back along the view ray — the fly-mode equivalent of
 * orbit's scroll-to-zoom (see `wheelDollyDistance`) — which is what makes a
 * trackpad's two-finger scroll useful here at all; the plain
 * `translateZ` call is deliberate rather than routing through the damped
 * velocity above, since a wheel event is already a discrete, self-contained
 * impulse rather than a held input that needs a hold-to-stop story.
 */
export function FlyCamera() {
  const speed = useAppStore((state) => state.camera.flySpeed)
  const look = useAppStore((state) => state.camera.flyLook)
  const camera = useThree((state) => state.camera)
  const domElement = useThree((state) => state.gl.domElement)

  const moveInput = useFlyKeyboard()
  const lookDelta = useFlyLook(domElement)
  const velocity = useRef<Vec3Tuple>([0, 0, 0])
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'))

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      camera.translateZ(wheelDollyDistance(event.deltaY, event.deltaMode, speed))
    }
    domElement.addEventListener('wheel', onWheel, { passive: false })
    return () => domElement.removeEventListener('wheel', onWheel)
  }, [domElement, camera, speed])

  useFrame((_, delta) => {
    applyLook(camera, euler.current, lookDelta.current, look)

    const move = moveInput.current
    const target = targetVelocity([move.x, move.y, move.z], speed)
    velocity.current = approachVelocity(velocity.current, target, delta)
    const [vx, vy, vz] = velocity.current
    if (vx !== 0 || vy !== 0 || vz !== 0) {
      camera.translateX(vx * delta)
      camera.translateY(vy * delta)
      camera.translateZ(vz * delta)
    }
  })

  return null
}

/** Reads the camera's current facing as yaw/pitch, applies the accumulated
 *  drag delta, then writes it back — and clears the delta, since it is only
 *  ever meant to be consumed once. */
function applyLook(
  camera: Camera,
  euler: Euler,
  lookDelta: { x: number; y: number },
  sensitivity: number,
): void {
  if (lookDelta.x === 0 && lookDelta.y === 0) return

  euler.setFromQuaternion(camera.quaternion, 'YXZ')
  euler.y -= lookDelta.x * LOOK_RADIANS_PER_PIXEL * sensitivity
  euler.x = clampPitch(euler.x - lookDelta.y * LOOK_RADIANS_PER_PIXEL * sensitivity)
  camera.quaternion.setFromEuler(euler)

  lookDelta.x = 0
  lookDelta.y = 0
}
