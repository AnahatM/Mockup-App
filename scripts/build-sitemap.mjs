/**
 * Generates public/sitemap.xml and robots.txt from the app's own route table
 * and manual.
 *
 * Generated rather than hand-written, and regenerated as part of the build, so
 * it cannot quietly stop matching what the site actually contains.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const BASE = (process.env.SITE_URL ?? 'https://mockup-studio.anahatmudgal.com').replace(/\/$/, '')

const routesSource = readFileSync('src/app/routes.ts', 'utf8')

/** The ROUTES object, as a key -> path map. */
function readRoutes() {
  const block = routesSource.slice(
    routesSource.indexOf('export const ROUTES = {'),
    routesSource.indexOf('} as const'),
  )
  return Object.fromEntries(
    [...block.matchAll(/(\w+):\s*'([^']+)'/g)].map(([, key, path]) => [key, path]),
  )
}

/** Route keys that opted into the sitemap, with their priority. */
function readPriorities() {
  return [
    ...routesSource.matchAll(
      /path:\s*ROUTES\.(\w+),[\s\S]*?sitemapPriority:\s*([\d.]+)/g,
    ),
  ].map(([, key, priority]) => ({ key, priority }))
}

function readDocSlugs() {
  const sections = ['gettingStarted', 'mockups', 'studio', 'output', 'advanced']
  const source = sections
    .map((name) => readFileSync(`src/content/docs/registry/${name}.ts`, 'utf8'))
    .join('\n')
  return [...source.matchAll(/slug: '([\w-]+)'/g)].map(([, slug]) => slug)
}

const routes = readRoutes()
const urls = [
  ...readPriorities()
    .map(({ key, priority }) => ({ loc: routes[key], priority }))
    .filter((entry) => Boolean(entry.loc)),
  ...readDocSlugs().map((slug) => ({ loc: `/docs/${slug}`, priority: '0.5' })),
]

if (urls.length === 0) {
  // Better to fail the build than to publish an empty sitemap that silently
  // tells crawlers the site has no pages.
  throw new Error('sitemap: no routes found — has routes.ts changed shape?')
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) =>
      `  <url>\n    <loc>${BASE}${entry.loc}</loc>\n    <priority>${entry.priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync('public/sitemap.xml', xml)
writeFileSync(
  'public/robots.txt',
  `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`,
)

console.log(`sitemap.xml: ${urls.length} urls (${readPriorities().length} pages)`)
