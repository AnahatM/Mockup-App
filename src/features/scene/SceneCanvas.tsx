import { Canvas } from '@react-three/fiber'
import { useAppStore } from '@/state/store'
import { Stage } from './Stage'
import { WebGLFallback } from './WebGLFallback'
import { hasWebGL } from './hasWebGL'

/**
 * The WebGL surface.
 *
 * `alpha` and `preserveDrawingBuffer` are both required for export: alpha so a
 * transparent-background PNG is possible, and preserveDrawingBuffer so the canvas
 * can still be read back after the frame has been presented.
 */
export function SceneCanvas() {
  const initialPosition = useAppStore((state) => state.camera.position)
  const initialFov = useAppStore((state) => state.camera.fov)

  // Checked before mounting rather than caught after: a failed Canvas leaves a
  // blank rectangle, which looks broken rather than explained.
  if (!hasWebGL()) return <WebGLFallback />

  return (
    <Canvas
      dpr={[1, 2]}
      shadows
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
      camera={{
        fov: initialFov,
        position: initialPosition,
        near: 0.1,
        far: 200,
      }}
    >
      <Stage />
    </Canvas>
  )
}
