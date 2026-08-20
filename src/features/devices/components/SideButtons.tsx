import { useMemo } from 'react'
import type { SurfaceTextureConfig } from '@/features/textures'
import { buildButton } from '../builders/buttons'
import { FinishMaterial } from '../materials/FinishMaterial'
import type { DeviceSpec, FinishKind } from '../spec/types'

export interface SideButtonsProps {
  spec: DeviceSpec
  frameColor: string
  finish: FinishKind
  texture: SurfaceTextureConfig
}

/** Volume rocker, power and action buttons, placed from the spec's rail offsets. */
export function SideButtons({ spec, frameColor, finish, texture }: SideButtonsProps) {
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
          castShadow
        >
          {/* Buttons are the same metal as the rail; the chamfer distinguishes them. */}
          <FinishMaterial finish={finish} color={frameColor} texture={texture} />
        </mesh>
      ))}
    </>
  )
}
