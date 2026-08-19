import { useMemo } from 'react'
import { FINISHES } from './finishes'
import { brushedRoughness, speckleRoughness } from './maps'
import type { FinishKind } from '../spec/types'

export interface FinishMaterialProps {
  finish: FinishKind
  color: string
  /** Multiplies the finish's base roughness, for per-device tweaking. */
  roughnessScale?: number
  /** Material slot, for geometry with multiple groups (e.g. 'material-1'). */
  attach?: string
}

/**
 * Renders the physical material for a device surface. Declarative rather than an
 * imperative factory, so three.js disposes it with the mesh.
 */
export function FinishMaterial({
  finish,
  color,
  roughnessScale = 1,
  attach,
}: FinishMaterialProps) {
  const spec = FINISHES[finish]
  const map = useMemo(() => {
    const contrast = spec.mapContrast ?? 0.06
    if (spec.map === 'speckle') return speckleRoughness(spec.roughness, contrast)
    if (spec.map === 'brushed-v' || spec.map === 'brushed-h') {
      return brushedRoughness({
        base: spec.roughness,
        contrast,
        vertical: spec.map === 'brushed-v',
      })
    }
    return null
  }, [spec])

  return (
    <meshPhysicalMaterial
      attach={attach ?? 'material'}
      color={color}
      metalness={spec.metalness}
      roughness={Math.min(1, spec.roughness * roughnessScale)}
      roughnessMap={map}
      anisotropy={spec.anisotropy ?? 0}
      anisotropyRotation={spec.anisotropyRotation ?? 0}
      clearcoat={spec.clearcoat ?? 0}
      clearcoatRoughness={spec.clearcoatRoughness ?? 0}
      iridescence={spec.iridescence ?? 0}
      reflectivity={spec.reflectivity ?? 0.5}
      envMapIntensity={1}
    />
  )
}
