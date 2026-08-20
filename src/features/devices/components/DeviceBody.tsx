import { useMemo } from 'react'
import type { SurfaceTextureConfig } from '@/features/textures'
import { buildBody } from '../builders/body'
import { FinishMaterial } from '../materials/FinishMaterial'
import type { DeviceSpec, FinishKind } from '../spec/types'

export interface DeviceBodyProps {
  spec: DeviceSpec
  bodyColor: string
  frameColor: string
  /** When false, the side band takes the body finish instead of the frame's. */
  showRails: boolean
  frameFinish: FinishKind
  backFinish: FinishKind
  bodyTexture: SurfaceTextureConfig
  frameTexture: SurfaceTextureConfig
}

/**
 * The shell, rendered as one mesh with two materials.
 *
 * ExtrudeGeometry emits two material groups — the flat caps, and the side walls
 * including the chamfer. That maps exactly onto a phone: matte glass front and
 * back, brushed metal band around the edge. Doing it with material groups rather
 * than a second mesh avoids coincident surfaces z-fighting along the rail, which
 * is precisely where the eye is drawn by the rim highlight.
 *
 * Geometry is memoised on the body dimensions alone, so recolouring never
 * rebuilds it.
 */
export function DeviceBody({
  spec,
  bodyColor,
  frameColor,
  showRails,
  frameFinish,
  backFinish,
  bodyTexture,
  frameTexture,
}: DeviceBodyProps) {
  const geometry = useMemo(() => buildBody(spec.body), [spec.body])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <FinishMaterial
        attach="material-0"
        finish={backFinish}
        color={bodyColor}
        texture={bodyTexture}
      />
      <FinishMaterial
        attach="material-1"
        finish={showRails ? frameFinish : backFinish}
        color={showRails ? frameColor : bodyColor}
        texture={showRails ? frameTexture : bodyTexture}
      />
    </mesh>
  )
}
