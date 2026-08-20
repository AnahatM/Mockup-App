import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ROUTES } from '../routes'
import { ErrorScreen, type ErrorAction } from './ErrorScreen'
import { clearLocalData } from './recovery'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Catches a runtime crash anywhere in the studio — most plausibly three.js or
 * React Three Fiber failing mid-render — so it degrades to a message instead
 * of the router's `errorElement` swallowing the entire app.
 *
 * This is deliberately a *router-level* boundary, wrapped around `<StudioPage>`
 * in `AppRouter`, not one reaching inside `SceneCanvas`. `features/` may not
 * import from `app/` (see docs/reference/architecture.md's layering rule), so
 * a boundary that needs `app`-level pieces — routes, this file's own styling —
 * cannot live inside `features/scene` without inverting that dependency. It
 * still isolates the failure to the studio: the rest of the site is untouched,
 * and it is a distinct message from `WebGLFallback`, which handles the very
 * different case of a browser that cannot start WebGL *before* anything has
 * mounted, not a crash after it has.
 */
export class StudioErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('Studio crashed:', error, info.componentStack)
  }

  private readonly retry = () => this.setState({ error: null })

  override render() {
    const { error } = this.state
    if (!error) return this.props.children

    const actions: ErrorAction[] = [
      { label: 'Try again', icon: 'reset', variant: 'primary', onClick: this.retry },
      { label: 'Back to home', icon: 'home', to: ROUTES.home },
      {
        label: 'Clear local data and reload',
        icon: 'trash',
        variant: 'danger',
        onClick: () => {
          clearLocalData()
          window.location.reload()
        },
      },
    ]

    return (
      <ErrorScreen
        icon="close"
        title="The studio crashed"
        description="Something went wrong rendering the 3D view. Your saved presets are untouched — try again first; if it keeps happening, corrupted saved data is the most likely cause."
        actions={actions}
        detail={import.meta.env.DEV ? `${error.name}: ${error.message}\n\n${error.stack ?? ''}` : undefined}
      />
    )
  }
}
