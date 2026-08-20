import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { NavigationHint } from '@/features/camera'
import { useAppStore } from '@/state/store'
import { FramePainted } from './FramePainted'
import { SceneLoading } from './SceneLoading'
import { Stage } from './Stage'
import { WebGLFallback } from './WebGLFallback'
import { hasWebGL } from './hasWebGL'

/**
 * The WebGL surface.
 *
 * `alpha` and `preserveDrawingBuffer` are both required for export: alpha so a
 * transparent-background PNG is possible, and preserveDrawingBuffer so the canvas
 * can still be read back after the frame has been presented.
 *
 * `SceneLoading` sits over the canvas until `FramePainted` reports a real
 * frame has been drawn — see that file for why this is the genuine readiness
 * signal rather than a timer. It is a sibling of `<Canvas>`, not a child of
 * it, because it renders a DOM overlay and needs the WebGL fallback branch
 * below to short-circuit before either ever mounts.
 */
export function SceneCanvas() {
  const initialPosition = useAppStore((state) => state.camera.position)
  const initialFov = useAppStore((state) => state.camera.fov)
  const [framePainted, setFramePainted] = useState(false)

  // Checked before mounting rather than caught after: a failed Canvas leaves a
  // blank rectangle, which looks broken rather than explained. This also means
  // the loading overlay never mounts on the fallback path — there is nothing
  // for it to wait on, only a permanent state to explain instead.
  if (!hasWebGL()) return <WebGLFallback />

  return (
    <>
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
        <FramePainted onPainted={() => setFramePainted(true)} />
      </Canvas>
      <SceneLoading framePainted={framePainted} />
      <NavigationHint />
    </>
  )
}
