import { useMemo } from 'react'
import { mix } from '@/lib/color/hex'
import { ShapeGeometry } from 'three'
import { buildBody } from '../builders/body'
import { keyboardTexture } from '../builders/keyboard'
import { squircleShape } from '../builders/shape'
import { FinishMaterial } from '../materials/FinishMaterial'
import type { DeviceConfig } from '../schema'
import type { DeviceSpec, HingeSpec } from '../spec/types'

export interface LaptopBaseProps {
  spec: DeviceSpec
  hinge: HingeSpec
  config: DeviceConfig
}

/**
 * The bottom half of a clamshell: unibody, keyboard deck and trackpad.
 *
 * Rotated so the deck faces up and the body extends toward the viewer from the
 * hinge line at its back edge.
 */
export function LaptopBase({ spec, hinge, config }: LaptopBaseProps) {
  const base = hinge.base
  const geometry = useMemo(() => buildBody(base), [base])
  const keyboard = useMemo(() => keyboardTexture(), [])
  const trackpad = useMemo(
    () => (hinge.trackpad ? buildTrackpad(hinge.trackpad) : null),
    [hinge.trackpad],
  )

  const deckZ = base.depth / 2 + 0.05

  return (
    <group position={[0, base.depth / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <FinishMaterial
          attach="material-0"
          finish={spec.materials.back}
          color={config.bodyColor}
        />
        <FinishMaterial
          attach="material-1"
          finish={spec.materials.frame}
          color={config.frameColor}
        />
      </mesh>

      {hinge.keyboard && keyboard && (
        <mesh position={[0, hinge.keyboard.y, deckZ]}>
          <planeGeometry args={[hinge.keyboard.width, hinge.keyboard.height]} />
          <meshStandardMaterial map={keyboard} roughness={0.78} metalness={0} />
        </mesh>
      )}

      {trackpad && hinge.trackpad && (
        <mesh geometry={trackpad} position={[0, hinge.trackpad.y, deckZ]}>
          {/* Trackpad glass is darker than the deck, and matte enough not to
              mirror the whole top softbox — a polished upward-facing plane under
              a large light otherwise reads as a sheet of white paper. */}
          <meshPhysicalMaterial
            color={mix(config.bodyColor, '#000000', 0.55)}
            roughness={0.82}
            metalness={0}
            clearcoat={0.08}
            clearcoatRoughness={0.5}
          />
        </mesh>
      )}
    </group>
  )
}

function buildTrackpad(trackpad: NonNullable<HingeSpec['trackpad']>): ShapeGeometry {
  return new ShapeGeometry(
    squircleShape({
      width: trackpad.width,
      height: trackpad.height,
      radius: Math.min(trackpad.width, trackpad.height) * 0.07,
      exponent: 4,
      segments: 8,
    }),
  )
}
