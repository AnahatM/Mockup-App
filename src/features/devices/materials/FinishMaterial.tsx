import { useMemo } from 'react'
import type { Texture } from 'three'
import { mapsKey, buildSurfaceMaps, type SurfaceTextureConfig } from '@/features/textures'
import { FINISHES, type Finish } from './finishes'
import { brushedRoughness, speckleRoughness } from './maps'
import type { FinishKind } from '../spec/types'

export interface FinishMaterialProps {
  finish: FinishKind
  color: string
  /** Multiplies the finish's base roughness, for per-device tweaking. */
  roughnessScale?: number
  /** Material slot, for geometry with multiple groups (e.g. 'material-1'). */
  attach?: string
  /** A user-chosen procedural pattern. Overrides the finish's own automatic
   *  map when set to anything but `kind: 'none'`. */
  texture?: SurfaceTextureConfig | undefined
}

/** The finish's own generated map — speckle, brushed, or none. */
function automaticMap(spec: Finish): Texture | null {
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
}

/** The finish's physically-optional fields, defaulted once so the JSX below
 *  reads as the resolved material rather than a wall of `?? 0` fallbacks. */
function resolvedExtras(spec: Finish) {
  return {
    anisotropy: spec.anisotropy ?? 0,
    anisotropyRotation: spec.anisotropyRotation ?? 0,
    clearcoat: spec.clearcoat ?? 0,
    clearcoatRoughness: spec.clearcoatRoughness ?? 0,
    iridescence: spec.iridescence ?? 0,
    reflectivity: spec.reflectivity ?? 0.5,
  }
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
  texture,
}: FinishMaterialProps) {
  const spec = FINISHES[finish]
  const autoMap = useMemo(() => automaticMap(spec), [spec])

  // A configured texture fully replaces the automatic finish map — the
  // finish's own roughness value is still what the pattern is drawn around,
  // see `buildSurfaceMaps`. Absent (the default), rendering is unchanged
  // from before this system existed, which is what keeps old presets intact.
  const overlay = useMemo(
    () => (texture && texture.kind !== 'none' ? buildSurfaceMaps(texture, spec.roughness) : null),
    [texture, spec.roughness],
  )
  const extras = resolvedExtras(spec)

  return (
    <meshPhysicalMaterial
      // The roughness slot always has the finish's automatic map, but the normal
      // slot does not — so this material needs the same rebuild. See `mapsKey`.
      key={mapsKey(overlay)}
      attach={attach ?? 'material'}
      color={color}
      metalness={spec.metalness}
      roughness={Math.min(1, spec.roughness * roughnessScale)}
      roughnessMap={overlay?.roughnessMap ?? autoMap}
      normalMap={overlay?.normalMap ?? null}
      envMapIntensity={1}
      {...extras}
    />
  )
}
