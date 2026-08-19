import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'
import {
  DARK_QUERY,
  readStoredMode,
  resolveTheme,
  writeStoredMode,
  type ResolvedTheme,
  type ThemeMode,
} from './theme'

/**
 * Owns <html data-theme> after hydration. The initial value was already written
 * before first paint by the inline script in index.html, so this never causes a
 * flash — it only takes over.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const [systemResolved, setSystemResolved] = useState<ResolvedTheme>(() =>
    resolveTheme('system'),
  )

  // Following the OS only matters while the user is on 'system'.
  useEffect(() => {
    if (mode !== 'system') return
    const media = window.matchMedia(DARK_QUERY)
    const sync = () => setSystemResolved(media.matches ? 'dark' : 'light')
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [mode])

  const resolved: ResolvedTheme = mode === 'system' ? systemResolved : mode

  useEffect(() => {
    document.documentElement.dataset['theme'] = resolved
  }, [resolved])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    writeStoredMode(next)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
