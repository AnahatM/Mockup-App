/**
 * User-facing documentation.
 *
 * SCOPE: this is for people *using* Mockup Studio. It is not the engineering
 * documentation in `docs/`. Do not mention file paths, component names or how
 * anything is implemented — a reader should not need to know what the app is
 * written in.
 *
 * Bodies are authored as real `.md` files and imported raw, so they can be
 * edited as markdown rather than wrestled with inside a template literal, and
 * so the registry stays short enough to read.
 */

export const DOC_SECTIONS = [
  'getting-started',
  'mockups',
  'studio',
  'output',
  'advanced',
] as const

export type DocSection = (typeof DOC_SECTIONS)[number]

export const DOC_SECTION_LABELS: Record<DocSection, string> = {
  'getting-started': 'Getting started',
  mockups: 'Making mockups',
  studio: 'The 3D studio',
  output: 'Exporting',
  advanced: 'Advanced',
}

export interface DocArticle {
  /** URL segment. Unique across the manual. */
  slug: string
  section: DocSection
  title: string
  /** One line, shown under the title and on cards. */
  summary: string
  /** Extra search terms a reader might use that are not in the prose. */
  keywords: readonly string[]
  /** Slugs to read next. */
  related?: readonly string[]
  /** Position within its section. */
  order: number
  /** GitHub-flavoured markdown. Headings start at `##`. */
  body: string
}

export interface DocSummary {
  slug: string
  section: DocSection
  title: string
  summary: string
  keywords: readonly string[]
  /** Rough reading time in minutes. */
  readMinutes: number
}

/** Average adult reading speed for technical prose. */
const WORDS_PER_MINUTE = 190

export function summarise(article: DocArticle): DocSummary {
  const words = article.body.split(/\s+/).length
  return {
    slug: article.slug,
    section: article.section,
    title: article.title,
    summary: article.summary,
    keywords: article.keywords,
    readMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
  }
}
