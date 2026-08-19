import { useMemo } from 'react'
import { buildButton } from '../builders/buttons'
import { FinishMaterial } from '../materials/FinishMaterial'
import type { DeviceSpec } from '../spec/types'

export interface SideButtonsProps {
  spec: DeviceSpec
  frameColor: string
}

/** Volume rocker, power and action buttons, placed from the spec's rail offsets. */
export function SideButtons({ spec, frameColor }: SideButtonsProps) {
  const placements = useMemo(
    () => spec.buttons.map((button) => buildButton(spec.body, button)),
    [spec],
  )

  return (
    <>
      {placements.map((placement, index) => (
        <mesh
          key={index}
          geometry={placement.geometry}
          position={placement.position}
          rotation={placement.rotation}
          castShadow
        >
          {/* Buttons are the same metal as the rail; the chamfer distinguishes them. */}
          <FinishMaterial finish={spec.materials.frame} color={frameColor} />
        </mesh>
      ))}
    </>
  )
}
