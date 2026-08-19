/**
 * Theme vocabulary.
 *
 * `ThemeMode` is what the user chooses. `ResolvedTheme` is what actually lands on
 * <html data-theme>. `system` is resolved to one of the two rather than handled by a
 * media query, which keeps tokens/semantic.css free of duplicated dark blocks.
 */
export const THEME_MODES = ['light', 'dark', 'system'] as const
export type ThemeMode = (typeof THEME_MODES)[number]

export type ResolvedTheme = 'light' | 'dark'

/** Shared with the pre-paint inline script in index.html. Keep the two in sync. */
export const THEME_STORAGE_KEY = 'mockup-studio:theme'

export const DARK_QUERY = '(prefers-color-scheme: dark)'

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value)
}

export function systemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? systemTheme() : mode
}

/**
 * Reads the mode the user previously chose. Storage can throw in private-mode
 * browsers, so failure falls back to following the system rather than surfacing.
 */
export function readStoredMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function writeStoredMode(mode: ThemeMode): void {
  try {
    if (mode === 'system') localStorage.removeItem(THEME_STORAGE_KEY)
    else localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    // Persistence is a convenience, not a requirement — never break the UI over it.
  }
}
