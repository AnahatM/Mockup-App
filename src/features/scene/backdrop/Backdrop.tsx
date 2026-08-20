import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useAppStore } from '@/state/store'
import { Structures } from '../environments'
import { Cyclorama } from './Cyclorama'
import { GridFloor } from './GridFloor'
import { useBackdropTexture } from './useBackdropTexture'

/**
 * Parametric backdrop.
 *
 * Two independent layers. `mode` decides what the scene's background is
 * painted with, and two of its values additionally place real geometry that
 * receives light. `structure` is separate from that — geometry standing in
 * front of whatever was painted, composing with any mode rather than
 * replacing it. ADR 0007 covers why those are two axes and not one enum.
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

  return (
    <>
      {config.mode === 'cyclorama' && <Cyclorama config={config} />}
      {config.mode === 'grid' && <GridFloor config={config} />}
      <Structures config={config.structure} />
    </>
  )
}
