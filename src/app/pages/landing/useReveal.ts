import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Marks an element "revealed" once it scrolls into view, so a caller can toggle a
 * CSS class that fades/slides it in. Resolves immediately — no animation — when
 * IntersectionObserver is unavailable or the user prefers reduced motion, so the
 * content is never hidden behind an effect that will not run.
 */
/** Longest the content may stay hidden waiting for the observer. */
const REVEAL_FAILSAFE_MS = 2500

export function useReveal<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const node = ref.current
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!node || prefersReduced || typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      /*
       * Threshold 0, not a fraction. A threshold is a proportion of the *target*
       * that must be visible, so an element taller than roughly six viewports
       * can never reach 0.15 and would stay invisible for ever. Any intersection
       * at all is the only height-independent trigger.
       */
      { threshold: 0, rootMargin: '0px 0px -5% 0px' },
    )
    observer.observe(node)

    // Belt and braces: content must never be permanently hidden behind an
    // effect. If the observer has not fired by now, show it anyway.
    const failsafe = window.setTimeout(() => setRevealed(true), REVEAL_FAILSAFE_MS)

    return () => {
      window.clearTimeout(failsafe)
      observer.disconnect()
    }
  }, [])

  return [ref, revealed]
}
