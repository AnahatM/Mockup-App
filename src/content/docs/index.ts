import { DOC_ARTICLES } from './registry'
import { summarise, type DocArticle, type DocSection, type DocSummary } from './types'

export { DOC_ARTICLES } from './registry'
export * from './types'

const BY_SLUG = new Map(DOC_ARTICLES.map((article) => [article.slug, article]))

export function findArticle(slug: string): DocArticle | undefined {
  return BY_SLUG.get(slug)
}

/** Summaries in reading order: by section, then by declared order. */
export function docIndex(): DocSummary[] {
  return DOC_ARTICLES.map(summarise)
}

export function articlesInSection(section: DocSection): DocSummary[] {
  return DOC_ARTICLES.filter((a) => a.section === section).map(summarise)
}
