import { screenLayout } from '../builders/screen'
import type { CreaseSpec, DeviceSpec } from '../spec/types'

export interface FoldCreaseProps {
  spec: DeviceSpec
  crease: CreaseSpec
  /** Front face of the screen, so the crease sits just above it. */
  z: number
}

/**
 * The fold line down a foldable's inner display.
 *
 * A folding phone without one does not read as folding — it reads as an
 * unusually wide phone, which is the whole reason the form factor is in the
 * catalogue. Real creases are a shallow trough in the glass: you see them as a
 * band where the reflection bends, not as a drawn line.
 *
 * So this is a soft band rather than a hole. It is deliberately faint —
 * strengthening it until it is obvious in a wide shot makes it look like a
 * scratch in a close one, and the crease is a thing you notice at an angle and
 * forget head-on, exactly as on the real hardware.
 */

/**
 * How much the band darkens what is under it.
 *
 * A translucent shade rather than a colour, because the crease has to darken
 * the *screenshot* as well as the empty screen — a real fold bends the light
 * coming off whatever is being displayed, and a band painted in the background
 * colour would sit on top of an uploaded image like a strip of tape.
 */
const SHADE = 0.28

export function FoldCrease({ spec, crease, z }: FoldCreaseProps) {
  const layout = screenLayout(spec.body, spec.screen)
  const along = crease.axis === 'x' ? layout.height : layout.width

  return (
    <mesh
      position={[0, layout.offsetY, z]}
      rotation={[0, 0, crease.axis === 'x' ? 0 : Math.PI / 2]}
      renderOrder={3}
    >
      {/* Width is the band, height runs the full span of the screen. */}
      <planeGeometry args={[crease.width, along]} />
      <meshBasicMaterial color="#000000" transparent opacity={SHADE} toneMapped={false} />
    </mesh>
  )
}
