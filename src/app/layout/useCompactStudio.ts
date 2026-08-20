import { useEffect, useState } from 'react'

/**
 * The `compact` breakpoint (900px, see docs/reference/design-tokens.md) below
 * which the device rail and inspector switch from fixed columns to
 * dismissible overlays.
 *
 * Read in JS as well as CSS because the toolbar needs to know: on a compact
 * viewport, opening one panel closes the other one, since two overlays each
 * covering most of the screen would just stack on top of each other. On a
 * wide viewport both stay open together, same as before this change.
 */
const QUERY = '(width <= 900px)'

export function useCompactStudio(): boolean {
  const [compact, setCompact] = useState(() => getQuery().matches)

  useEffect(() => {
    const mql = getQuery()
    const onChange = () => setCompact(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return compact
}

/** `matchMedia` is absent under jsdom unless a test stubs it in — fail open
 *  to "not compact" rather than throwing. */
function getQuery(): MediaQueryList {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return {
      matches: false,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    } as unknown as MediaQueryList
  }
  return window.matchMedia(QUERY)
}
