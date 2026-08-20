/**
 * Throws unconditionally, purely so the error boundary has something real to
 * catch. Only ever wired into the router behind `import.meta.env.DEV` — see
 * `AppRouter` — and guarded again here so it is inert if that ever changes.
 *
 * This is a manual verification aid, not application behaviour: it exists for
 * `scripts/verify-errors.mjs` to navigate to and confirm `RouteErrorPage`
 * renders instead of react-router's default crash screen.
 */
export function CrashTestPage(): never {
  if (!import.meta.env.DEV) {
    throw new Error('CrashTestPage must never render outside development.')
  }
  throw new Error('Intentional crash from /__crash-test, for verifying the error boundary.')
}
