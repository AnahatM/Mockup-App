import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DOC_ARTICLES } from './registry'
import { DOC_SECTIONS } from './types'

/**
 * Holds the manual against the files on disk.
 *
 * An article is a `.md` file plus a registry entry. Write the file and forget
 * the entry and the page simply does not exist — no error, no broken link, just
 * prose nobody will ever see. Register a slug with no file and the import fails
 * at build time, which is at least loud; this covers the quiet direction.
 */
const files = readdirSync('src/content/docs/articles')
  .filter((name) => name.endsWith('.md'))
  .map((name) => name.replace(/\.md$/, ''))

describe('the documentation registry', () => {
  it('finds article files at all', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('registers every article file', () => {
    const registered = new Set(DOC_ARTICLES.map((article) => article.slug))
    const unregistered = files.filter((slug) => !registered.has(slug))

    expect(unregistered, 'article files with no registry entry').toEqual([])
  })

  it('has a file for every registered article', () => {
    const onDisk = new Set(files)
    const missing = DOC_ARTICLES.map((a) => a.slug).filter((slug) => !onDisk.has(slug))

    expect(missing, 'registered slugs with no article file').toEqual([])
  })

  it('uses a unique slug per article', () => {
    const slugs = DOC_ARTICLES.map((article) => article.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('puts every article in a known section', () => {
    for (const article of DOC_ARTICLES) {
      expect(DOC_SECTIONS).toContain(article.section)
    }
  })

  it('leaves no section empty', () => {
    for (const section of DOC_SECTIONS) {
      const inSection = DOC_ARTICLES.filter((a) => a.section === section)
      expect(inSection.length, `section "${section}" has no articles`).toBeGreaterThan(0)
    }
  })

  it('gives every article a title, summary and body', () => {
    for (const article of DOC_ARTICLES) {
      expect(article.title, `title for ${article.slug}`).toBeTruthy()
      expect(article.summary, `summary for ${article.slug}`).toBeTruthy()
      expect(article.body.length, `body for ${article.slug}`).toBeGreaterThan(80)
    }
  })
})
