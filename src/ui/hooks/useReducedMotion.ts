import { useEffect, useState } from 'react'

/**
 * Tracks the OS "reduce motion" setting, and follows it if it changes.
 *
 * Lives in `ui/` rather than beside any one animation because more than one
 * thing in the app moves: the product clip, the pulsating backdrop blocks and
 * the landing page reveals all need the same answer, and all need it to stay
 * live rather than being sampled once at mount.
 */
export function useReducedMotion(): boolean {
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
