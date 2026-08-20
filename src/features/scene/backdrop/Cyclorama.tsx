import { useEffect, useMemo } from 'react'
import type { BackdropConfig } from '../schema'
import { buildMaterial, buildSweep } from './cycloramaGeometry'

/**
 * An infinite-corner studio sweep: floor curving up into a back wall with no
 * visible seam. Real geometry rather than a painted gradient, so it catches the
 * rig's light and the product's contact shadow.
 *
 * See `buildSweep` in `cycloramaGeometry.ts` for why this is a hand-built open
 * ribbon rather than an extruded solid — that is what fixes both the "large
 * triangular thing in the background" from a wide angle and desktop devices
 * vanishing behind the sweep entirely once their camera sat far enough back.
 */
export function Cyclorama({ config }: { config: BackdropConfig }) {
  const geometry = useMemo(() => buildSweep(), [])
  const material = useMemo(
    () => buildMaterial(config.color, config.texture),
    [config.color, config.texture],
  )

  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh geometry={geometry} material={material} position={[0, 0, 0]} receiveShadow />
  )
}
