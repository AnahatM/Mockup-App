import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useAppStore } from '@/state/store'
import { Cyclorama } from './Cyclorama'
import { GridFloor } from './GridFloor'
import { useBackdropTexture } from './useBackdropTexture'

/**
 * Parametric backdrop. Flat modes are painted into the scene background; the
 * cyclorama and grid additionally place real geometry that receives light.
 */
export function Backdrop() {
  const config = useAppStore((state) => state.scene.backdrop)
  const scene = useThree((state) => state.scene)
  const texture = useBackdropTexture(config)

  useEffect(() => {
    scene.background = texture
    return () => {
      scene.background = null
    }
  }, [scene, texture])

  if (config.mode === 'cyclorama') return <Cyclorama config={config} />
  if (config.mode === 'grid') return <GridFloor config={config} />
  return null
}
