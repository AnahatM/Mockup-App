import { Suspense } from 'react'
import type { Texture } from 'three'
import { useAppStore } from '@/state/store'
import type { GlbSource } from '../schema'
import { GlbErrorBoundary } from './GlbErrorBoundary'
import { GlbModel } from './GlbModel'

export interface GlbDeviceProps {
  source: GlbSource
  screenTexture: Texture | null
  brightness: number
}

/**
 * Renders a user-imported GLB/GLTF, applying the screenshot to whichever mesh
 * was chosen as the screen and leaving every other material exactly as
 * authored (requirement: "use the model's own materials").
 *
 * The error boundary is keyed by URL so a fresh import attempt — even of a
 * file that previously failed — always gets a clean try rather than staying
 * latched in the failed state.
 */
export function GlbDevice({ source, screenTexture, brightness }: GlbDeviceProps) {
  const setGlbMeshes = useAppStore((state) => state.setGlbMeshes)
  const setGlbBounds = useAppStore((state) => state.setGlbBounds)
  const setGlbError = useAppStore((state) => state.setGlbError)

  return (
    <GlbErrorBoundary key={source.url} onError={setGlbError}>
      <Suspense fallback={null}>
        <GlbModel
          url={source.url}
          screenMesh={source.screenMesh}
          texture={screenTexture}
          brightness={brightness}
          onMeshes={setGlbMeshes}
          onBounds={setGlbBounds}
          onError={setGlbError}
        />
      </Suspense>
    </GlbErrorBoundary>
  )
}
