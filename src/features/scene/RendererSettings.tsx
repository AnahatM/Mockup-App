import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { NoToneMapping } from 'three'
import { useAppStore } from '@/state/store'
import { BACKDROP_LAYER } from './layers'

/**
 * Applies render settings that live on the renderer rather than in the tree.
 *
 * Tone mapping is deliberately OFF here: the composer in `PostFx` owns it, so
 * that bloom operates on linear HDR values. The exposure value is still set on
 * the renderer, because three's ACES shader chunk — which the composer's tone
 * mapping effect reuses — reads it from the `toneMappingExposure` uniform.
 */
export function RendererSettings() {
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const exposure = useAppStore((state) => state.scene.exposure)

  useEffect(() => {
    gl.toneMapping = NoToneMapping
    gl.toneMappingExposure = exposure
  }, [gl, exposure])

  // The viewport draws the backdrop layer alongside the default one; the
  // contact shadow's own camera is left on the default only, which is the
  // whole point of the layer. See `layers.ts`.
  useEffect(() => {
    camera.layers.enable(BACKDROP_LAYER)
  }, [camera])

  return null
}
