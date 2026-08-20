import { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AboutPage } from './pages/AboutPage'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { SitemapPage } from './pages/SitemapPage'
import { RouteFallback } from './RouteFallback'
import { DocArticlePage } from './docs/DocArticlePage'
import { DocsIndexPage } from './docs/DocsIndexPage'
import { SiteShell } from './site/SiteShell'
import { RouteErrorPage } from './errors/RouteErrorPage'
import { StudioErrorBoundary } from './errors/StudioErrorBoundary'
import { CrashTestPage } from './errors/CrashTestPage'
import { ShortcutsOverlay } from './shortcuts/ShortcutsOverlay'
import { ROUTES } from './routes'

/*
 * The two tools are loaded on demand, and only these two.
 *
 * The studio pulls three.js, drei and the postprocessing chain — well over a
 * megabyte that a visitor reading the documentation has no use for. Splitting
 * them here means the marketing and docs pages no longer carry the 3D stack.
 *
 * The window tool is split for the opposite reason: it must be *cheap* to open,
 * which is the entire argument of ADR 0006.
 */
const StudioPage = lazy(() =>
  import('./pages/StudioPage').then((m) => ({ default: m.StudioPage })),
)
const WindowPage = lazy(() =>
  import('./pages/WindowPage').then((m) => ({ default: m.WindowPage })),
)

/** Wraps a lazily-loaded route so its chunk has something to show while it arrives. */
const deferred = (node: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{node}</Suspense>
)

/**
 * The route table.
 *
 * The studio sits outside the site shell: it is a fixed-frame tool that fills
 * the viewport and manages its own chrome, so wrapping it in a navbar and footer
 * would either scroll the canvas away or shrink it for nothing. It gets its own
 * `StudioErrorBoundary` for the same reason — a three.js crash there is a
 * narrower failure than a crash on a site page, and deserves a narrower recovery
 * screen, not the router's own top-level one.
 *
 * Everything sits under one pathless root route so `errorElement` is declared
 * once, at `id: 'root'`, and catches a render error anywhere below it — see
 * `errors/RouteErrorPage`. A pathless route with no `element` renders its
 * children's `<Outlet/>` implicitly, so this adds no extra DOM or visible chrome.
 */
const router = createBrowserRouter([
  {
    id: 'root',
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <SiteShell />,
        children: [
          { path: ROUTES.home, element: <LandingPage /> },
          { path: ROUTES.docs, element: <DocsIndexPage /> },
          { path: ROUTES.docsArticle, element: <DocArticlePage /> },
          { path: ROUTES.about, element: <AboutPage /> },
          { path: ROUTES.privacy, element: <PrivacyPage /> },
          { path: ROUTES.sitemap, element: <SitemapPage /> },
          { path: ROUTES.window, element: deferred(<WindowPage />) },
          // Dev-only route for exercising the error boundary — see CrashTestPage.
          ...(import.meta.env.DEV
            ? [{ path: '/__crash-test', element: <CrashTestPage /> }]
            : []),
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        path: ROUTES.studio,
        element: (
          <StudioErrorBoundary>
            {deferred(
              <>
                <StudioPage />
                <ShortcutsOverlay />
              </>,
            )}
          </StudioErrorBoundary>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
