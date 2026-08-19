import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useAppStore } from '@/state/store'
import { findClip } from './clips'

/**
 * Drives the animation clip.
 *
 * Wraps the product in its own group and mutates that group's transform in the
 * frame loop rather than writing to the store. Store writes at 60fps would
 * re-render the whole inspector every frame and flood the undo history; the clip
 * is transient motion layered on top of the authored transform, not a change to
 * it.
 *
 * Camera orbit is applied through the orbit controls rather than to the camera
 * directly, so it composes with the user's own navigation instead of fighting it.
 */
export function AnimatedProduct({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null)
  const elapsed = useRef(0)
  const epoch = useRef(0)
  const baseAzimuth = useRef<number | null>(null)
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null

  // Someone who has asked the system for less motion should not be handed a
  // spinning product. The clip still applies, held at its resting frame, so
  // exports and recordings are unaffected.
  const reducedMotion = usePrefersReducedMotion()

  useFrame((_, delta) => {
    const node = group.current
    if (!node) return

    const { animation, animationEpoch } = useAppStore.getState()
    const { clip, duration, easing, amplitude, loop, playing, progress } = animation

    // A restart is signalled by the epoch changing, because the clock that
    // needs rewinding is this ref, not anything the store holds.
    if (animationEpoch !== epoch.current) {
      epoch.current = animationEpoch
      elapsed.current = 0
    }
    const definition = findClip(clip)

    if (!definition || clip === 'none') {
      node.position.set(0, 0, 0)
      node.rotation.set(0, 0, 0)
      node.scale.setScalar(1)
      elapsed.current = 0
      return
    }

    if (playing && !reducedMotion) {
      elapsed.current += delta
      // One-shot clips hold their final frame instead of snapping back.
      if (elapsed.current > duration) {
        elapsed.current = loop ? elapsed.current % duration : duration
      }
    } else {
      // Paused: the scrubber owns the position.
      elapsed.current = progress * duration
    }

    // `elapsed` is already wrapped for looping and clamped for one-shot clips,
    // so this is a straightforward 0-1 through the cycle.
    const t = Math.min(elapsed.current / duration, 1)
    const frame = definition.frame({ t, amplitude, easing })

    node.position.set(...frame.position)
    node.rotation.set(...frame.rotation)
    node.scale.setScalar(frame.scale)

    if (frame.orbit !== 0 && controls) {
      baseAzimuth.current ??= controls.getAzimuthalAngle()
      controls.setAzimuthalAngle(baseAzimuth.current + frame.orbit)
    }
  })

  return <group ref={group}>{children}</group>
}

/** Tracks the OS "reduce motion" setting, and follows it if it changes. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return reduced
}
