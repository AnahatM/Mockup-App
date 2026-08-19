/**
 * Every route in the app, in one place.
 *
 * Declared as data so the navbar, the footer and the sitemap page all read from
 * the same source — three hand-maintained lists of links is how a sitemap ends
 * up lying about what exists.
 */
export interface RouteMeta {
  path: string
  label: string
  /** One line, used on the sitemap page. */
  summary: string
  /** Shown in the main navigation. */
  inNav: boolean
  /** Shown in the footer. */
  inFooter: boolean
  /** Included in sitemap.xml, with this priority. */
  sitemapPriority?: number
}

export const ROUTES = {
  home: '/',
  studio: '/studio',
  docs: '/docs',
  docsArticle: '/docs/:slug',
  about: '/about',
  privacy: '/privacy',
  sitemap: '/sitemap',
} as const

export const SITE_ROUTES: readonly RouteMeta[] = [
  {
    path: ROUTES.home,
    label: 'Home',
    summary: 'What Mockup Studio is and what it can do.',
    inNav: false,
    inFooter: true,
    sitemapPriority: 1,
  },
  {
    path: ROUTES.studio,
    label: 'Studio',
    summary: 'The mockup tool itself — devices, lighting, export.',
    inNav: true,
    inFooter: true,
    sitemapPriority: 0.9,
  },
  {
    path: ROUTES.docs,
    label: 'Docs',
    summary: 'Guides for every part of the app, searchable.',
    inNav: true,
    inFooter: true,
    sitemapPriority: 0.8,
  },
  {
    path: ROUTES.about,
    label: 'About',
    summary: 'Why this exists, how it was built, and who built it.',
    inNav: true,
    inFooter: true,
    sitemapPriority: 0.6,
  },
  {
    path: ROUTES.privacy,
    label: 'Privacy',
    summary: 'What happens to your files. Short version: nothing leaves your device.',
    inNav: false,
    inFooter: true,
    sitemapPriority: 0.4,
  },
  {
    path: ROUTES.sitemap,
    label: 'Sitemap',
    summary: 'Everything in Mockup Studio, on one page.',
    inNav: false,
    inFooter: true,
    sitemapPriority: 0.3,
  },
]

export const navRoutes = (): RouteMeta[] => SITE_ROUTES.filter((r) => r.inNav)
export const footerRoutes = (): RouteMeta[] => SITE_ROUTES.filter((r) => r.inFooter)

/** Canonical external links, so they are never retyped. */
export const LINKS = {
  repo: 'https://github.com/AnahatM/MockupStudio',
  repoIssues: 'https://github.com/AnahatM/MockupStudio/issues',
  license: 'https://github.com/AnahatM/MockupStudio/blob/main/LICENSE',
  author: 'https://anahatmudgal.com',
  authorGithub: 'https://github.com/anahatm',
} as const

export const docPath = (slug: string): string => `${ROUTES.docs}/${slug}`
