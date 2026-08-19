import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { setCaptureHandle } from './handle'

/** Mounted inside the Canvas. Publishes the renderer handle for its lifetime. */
export function CaptureBridge() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)
  const advance = useThree((state) => state.advance)

  useEffect(() => {
    setCaptureHandle({
      renderer: gl,
      scene,
      camera,
      // Advancing the R3F loop renders through the effect composer when one is
      // mounted. Calling gl.render directly would silently drop bloom and tone
      // mapping from every export.
      render: () => advance(performance.now(), true),
    })
    return () => setCaptureHandle(null)
  }, [gl, scene, camera, advance])

  return null
}
