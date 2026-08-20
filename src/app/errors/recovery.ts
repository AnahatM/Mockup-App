const PREFIX = 'mockup-studio:'

/**
 * Clears everything this app has ever written to localStorage — saved presets,
 * the theme choice, recent uploads.
 *
 * Offered as a last-resort recovery action on the error screens: if a crash is
 * caused by corrupted saved state (a hand-edited preset, a value from a future
 * version of the app), reloading alone will not fix it, but this will. Scoped
 * to the app's own `mockup-studio:` key prefix so it can never touch data that
 * belongs to another site sharing the same browser.
 */
export function clearLocalData(): void {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(PREFIX)) localStorage.removeItem(key)
    }
  } catch {
    // Storage may be unavailable (private browsing, a locked-down browser).
    // There is nothing to clear in that case, and nothing more to do.
  }
}
