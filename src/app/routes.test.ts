import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ROUTES, SITE_ROUTES, footerRoutes, navRoutes } from './routes'

/**
 * Holds the navigation against the router.
 *
 * The navbar, the footer, the sitemap page and `sitemap.xml` all read from
 * `SITE_ROUTES`. Nothing forces the router and that table to agree, so a route
 * added to one and not the other disappears from every index of the site at
 * once — silently, and in the way least likely to be noticed, because the page
 * still works if you know its URL.
 */
const routerSource = readFileSync('src/app/AppRouter.tsx', 'utf8')

/** Route keys the router actually registers, e.g. 'home', 'studio'. */
const registered = [...routerSource.matchAll(/path:\s*ROUTES\.(\w+)/g)]
  .map(([, key]) => key)
  .filter((key): key is string => key !== undefined)

/** The path a route key maps to, or undefined if the key is not in the table. */
const pathFor = (key: string): string | undefined =>
  (ROUTES as Record<string, string>)[key]

/**
 * Routes deliberately absent from the site index.
 *
 * `docsArticle` is a pattern, not a page — the sitemap lists real articles from
 * the docs registry instead.
 */
const NOT_INDEXED = new Set(['docsArticle'])

describe('the route table', () => {
  it('registers something', () => {
    expect(registered.length).toBeGreaterThan(0)
  })

  it('lists every registered route in SITE_ROUTES', () => {
    const listed = new Set(SITE_ROUTES.map((route) => route.path))
    const missing = registered
      .filter((key) => !NOT_INDEXED.has(key))
      .map(pathFor)
      .filter((path) => path !== undefined && !listed.has(path))

    expect(missing, 'registered in the router but absent from SITE_ROUTES').toEqual([])
  })

  it('does not list a route the router never registers', () => {
    const registeredPaths = new Set(registered.map(pathFor))
    const orphans = SITE_ROUTES.map((route) => route.path).filter(
      (path) => !registeredPaths.has(path),
    )

    expect(orphans, 'listed in SITE_ROUTES but not routed').toEqual([])
  })

  it('gives every listed route a label and a summary', () => {
    for (const route of SITE_ROUTES) {
      expect(route.label, `label for ${route.path}`).toBeTruthy()
      expect(route.summary, `summary for ${route.path}`).toBeTruthy()
    }
  })

  it('puts every route somewhere a visitor can find it', () => {
    const reachable = new Set([
      ...navRoutes().map((r) => r.path),
      ...footerRoutes().map((r) => r.path),
    ])
    const orphaned = SITE_ROUTES.filter((r) => !reachable.has(r.path)).map((r) => r.path)

    expect(orphaned, 'in SITE_ROUTES but in neither the nav nor the footer').toEqual([])
  })

  it('gives sitemap-included routes a priority in range', () => {
    for (const route of SITE_ROUTES) {
      if (route.sitemapPriority === undefined) continue
      expect(route.sitemapPriority).toBeGreaterThan(0)
      expect(route.sitemapPriority).toBeLessThanOrEqual(1)
    }
  })

  it('uses unique paths', () => {
    const paths = SITE_ROUTES.map((route) => route.path)
    expect(new Set(paths).size).toBe(paths.length)
  })
})
