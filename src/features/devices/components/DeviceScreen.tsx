import { useMemo } from 'react'
import { buildScreen, screenLayout } from '../builders/screen'
import type { DeviceSpec } from '../spec/types'
import type { Texture } from 'three'

export interface DeviceScreenProps {
  spec: DeviceSpec
  z: number
  texture: Texture | null
  /** How brightly the display self-illuminates. */
  brightness: number
}

/**
 * The display panel.
 *
 * Uses emissive rather than a plain unlit material so the screen behaves like a
 * real one: it glows at its own brightness *and* still picks up reflections from
 * the rig, which is what stops a mockup looking like a sticker.
 */
export function DeviceScreen({ spec, z, texture, brightness }: DeviceScreenProps) {
  const layout = useMemo(() => screenLayout(spec.body, spec.screen), [spec])
  const geometry = useMemo(() => buildScreen(layout), [layout])

  // With no media there is no map to modulate the emissive, so a white emissive
  // would blow the whole panel out. An empty screen should read as a switched-off
  // display: dark, still glassy, still catching the rig's reflection.
  const idle = texture === null

  return (
    <mesh geometry={geometry} position={[0, layout.offsetY, z]} renderOrder={1}>
      <meshStandardMaterial
        map={texture}
        emissiveMap={texture}
        emissive={idle ? '#0a0d14' : '#ffffff'}
        emissiveIntensity={idle ? 0.4 : brightness}
        color={idle ? '#05070b' : '#000000'}
        roughness={idle ? 0.08 : 0.16}
        metalness={0}
      />
    </mesh>
  )
}
