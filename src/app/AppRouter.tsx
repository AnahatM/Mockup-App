import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AboutPage } from './pages/AboutPage'
import { LandingPage } from './pages/LandingPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { SitemapPage } from './pages/SitemapPage'
import { StudioPage } from './pages/StudioPage'
import { DocArticlePage } from './docs/DocArticlePage'
import { DocsIndexPage } from './docs/DocsIndexPage'
import { SiteShell } from './site/SiteShell'
import { RouteErrorPage } from './errors/RouteErrorPage'
import { StudioErrorBoundary } from './errors/StudioErrorBoundary'
import { CrashTestPage } from './errors/CrashTestPage'
import { ShortcutsOverlay } from './shortcuts/ShortcutsOverlay'
import { ROUTES } from './routes'

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
            <StudioPage />
            <ShortcutsOverlay />
          </StudioErrorBoundary>
        ),
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
