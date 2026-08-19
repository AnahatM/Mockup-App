import { EmptyState } from '@/ui'

/**
 * Shown when the browser cannot give us a WebGL context.
 *
 * Without this the app renders a blank rectangle and looks broken, which is a
 * worse failure than saying plainly what happened.
 */
export function WebGLFallback() {
  return (
    <EmptyState
      icon="monitor"
      title="3D is unavailable"
      description="This browser could not start WebGL. Try enabling hardware acceleration, or open Mockup Studio in a different browser."
    />
  )
}
