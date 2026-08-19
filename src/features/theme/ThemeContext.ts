import { createContext } from 'react'
import type { ResolvedTheme, ThemeMode } from './theme'

export interface ThemeContextValue {
  /** What the user chose — may be 'system'. */
  mode: ThemeMode
  /** What is actually applied to <html data-theme>. Never 'system'. */
  resolved: ResolvedTheme
  setMode: (mode: ThemeMode) => void
}

/**
 * Kept in its own module so ThemeProvider.tsx exports only a component and stays
 * compatible with react-refresh's fast-refresh boundary rules.
 */
export const ThemeContext = createContext<ThemeContextValue | null>(null)
