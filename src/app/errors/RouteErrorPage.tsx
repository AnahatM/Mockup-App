import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { ROUTES } from '../routes'
import { ErrorScreen, type ErrorAction } from './ErrorScreen'
import { clearLocalData } from './recovery'

/**
 * The router's top-level `errorElement`.
 *
 * Every route in `AppRouter` sits under a pathless parent that carries this,
 * so a render error anywhere — a bad route response, a crash react-router
 * itself did not expect — lands here instead of on the framework's raw
 * "Unexpected Application Error!" screen. `useRouteError` is the only way to
 * read what was thrown; `isRouteErrorResponse` tells a genuine thrown 404 (or
 * another status) apart from an ordinary JS exception, since the two need
 * different copy.
 */
export function RouteErrorPage() {
  const error = useRouteError()
  const info = describe(error)

  const actions: ErrorAction[] = [
    { label: 'Reload the page', icon: 'reset', variant: 'primary', onClick: () => window.location.reload() },
    { label: 'Go home', icon: 'home', to: ROUTES.home },
  ]
  if (!info.isNotFound) {
    actions.push({
      label: 'Clear local data and reload',
      icon: 'trash',
      variant: 'danger',
      onClick: () => {
        clearLocalData()
        window.location.reload()
      },
    })
  }

  return (
    <ErrorScreen
      icon={info.icon}
      title={info.title}
      description={info.description}
      actions={actions}
      note={
        info.isNotFound
          ? undefined
          : 'Your saved presets live in this browser, not on a server, and were not affected. Clearing local data only helps if corrupted saved state is what caused this.'
      }
      detail={import.meta.env.DEV ? detailFor(error) : undefined}
    />
  )
}

interface ErrorInfo {
  icon: 'map' | 'close'
  title: string
  description: string
  isNotFound: boolean
}

function describe(error: unknown): ErrorInfo {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        icon: 'map',
        title: 'Page not found',
        description: 'That page does not exist. It may have moved, or the link may be wrong.',
        isNotFound: true,
      }
    }
    return {
      icon: 'close',
      title: `Something went wrong (${error.status})`,
      description: error.statusText || 'The app hit an unexpected error loading this page.',
      isNotFound: false,
    }
  }
  return {
    icon: 'close',
    title: 'Something went wrong',
    description:
      "Mockup Studio hit an unexpected error and couldn't continue. Reloading fixes this most of the time.",
    isNotFound: false,
  }
}

function detailFor(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}\n\n${error.stack ?? ''}`
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}\n${JSON.stringify(error.data, null, 2)}`
  }
  return String(error)
}
