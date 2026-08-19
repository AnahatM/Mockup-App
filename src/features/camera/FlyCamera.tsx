import { FlyControls } from '@react-three/drei'
import { useAppStore } from '@/state/store'

/**
 * Free camera: WASD to move, R/F for up and down, drag to look.
 *
 * Orbit controls always circle a target, which is right for inspecting a product
 * but means the camera can never leave that sphere — you cannot push in past the
 * pivot or fly around the room. This releases it.
 *
 * `dragToLook` is deliberate rather than pointer lock: pointer lock hides the
 * cursor and swallows Escape, which is hostile in an app whose controls live
 * beside the viewport.
 */
export function FlyCamera() {
  const speed = useAppStore((state) => state.camera.flySpeed)
  const look = useAppStore((state) => state.camera.flyLook)

  return (
    <FlyControls
      makeDefault
      dragToLook
      movementSpeed={speed}
      rollSpeed={look}
      autoForward={false}
    />
  )
}
