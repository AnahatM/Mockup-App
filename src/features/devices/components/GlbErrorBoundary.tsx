import { Component, type ReactNode } from 'react'

export interface GlbErrorBoundaryProps {
  onError: (message: string) => void
  children: ReactNode
}

interface GlbErrorBoundaryState {
  hasError: boolean
}

/**
 * Catches a failed `useGLTF` suspense load locally.
 *
 * `useGLTF` throws the rejection reason once loading fails, which React
 * treats like any other render error — it would otherwise be caught by the
 * app's studio-level error boundary and take over the whole canvas for what
 * is really just a bad file. This boundary is scoped to the import itself, so
 * a corrupt or unsupported model surfaces as a message in the device panel
 * instead. Give it `key={url}` so a new import attempt gets a fresh instance.
 */
export class GlbErrorBoundary extends Component<GlbErrorBoundaryProps, GlbErrorBoundaryState> {
  override state: GlbErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): GlbErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error)
    this.props.onError(`Could not load this model — ${message}`)
  }

  override render(): ReactNode {
    return this.state.hasError ? null : this.props.children
  }
}
