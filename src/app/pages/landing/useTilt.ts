import { useEffect, useRef, type RefObject } from 'react'

/**
 * Applies a subtle pointer-driven 3D tilt to the returned ref's element, via the
 * `--tilt-x` / `--tilt-y` custom properties a stylesheet reads into a `rotate*()`.
 * Entirely inert — the properties are simply never set — when the user prefers
 * reduced motion, so the element stays flat with no code branch to remember.
 */
export function useTilt<T extends HTMLElement>(maxDeg = 6): RefObject<T | null> {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const node = ref.current
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!node || prefersReduced) return

    const handleMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect()
      const px = (event.clientX - rect.left) / rect.width - 0.5
      const py = (event.clientY - rect.top) / rect.height - 0.5
      node.style.setProperty('--tilt-x', `${(-py * maxDeg).toFixed(2)}deg`)
      node.style.setProperty('--tilt-y', `${(px * maxDeg).toFixed(2)}deg`)
    }
    const handleLeave = () => {
      node.style.setProperty('--tilt-x', '0deg')
      node.style.setProperty('--tilt-y', '0deg')
    }

    node.addEventListener('pointermove', handleMove)
    node.addEventListener('pointerleave', handleLeave)
    return () => {
      node.removeEventListener('pointermove', handleMove)
      node.removeEventListener('pointerleave', handleLeave)
    }
  }, [maxDeg])

  return ref
}
