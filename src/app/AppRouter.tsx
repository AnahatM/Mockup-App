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
import { ROUTES } from './routes'

/**
 * The route table.
 *
 * The studio sits outside the site shell: it is a fixed-frame tool that fills
 * the viewport and manages its own chrome, so wrapping it in a navbar and footer
 * would either scroll the canvas away or shrink it for nothing.
 */
const router = createBrowserRouter([
  {
    element: <SiteShell />,
    children: [
      { path: ROUTES.home, element: <LandingPage /> },
      { path: ROUTES.docs, element: <DocsIndexPage /> },
      { path: ROUTES.docsArticle, element: <DocArticlePage /> },
      { path: ROUTES.about, element: <AboutPage /> },
      { path: ROUTES.privacy, element: <PrivacyPage /> },
      { path: ROUTES.sitemap, element: <SitemapPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  { path: ROUTES.studio, element: <StudioPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
