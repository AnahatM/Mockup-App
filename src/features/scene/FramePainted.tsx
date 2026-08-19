import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export interface FramePaintedProps {
  onPainted: () => void
}

/**
 * Fires once — on the first tick of react-three-fiber's render loop after
 * mount, i.e. once a frame has genuinely been drawn, not merely once the
 * WebGL context exists.
 *
 * Mounted as a sibling of `<Stage>` inside `<Canvas>` (see `SceneCanvas`)
 * rather than nested inside it, so this can never be affected by Stage's own
 * composition or its internal `<Suspense>` boundary — it answers a narrower
 * question ("has anything been painted yet") that stays true regardless of
 * what Stage ends up containing.
 */
export function FramePainted({ onPainted }: FramePaintedProps) {
  const fired = useRef(false)

  useFrame(() => {
    if (fired.current) return
    fired.current = true
    onPainted()
  })

  return null
}
