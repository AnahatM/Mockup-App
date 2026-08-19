import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { Icon, TextInput } from '@/ui'
import {
  DOC_SECTIONS,
  DOC_SECTION_LABELS,
  docIndex,
  type DocSummary,
} from '@/content/docs'
import { docPath } from '../routes'
import styles from './Docs.module.css'

/** Substring match across the fields a reader would search by. */
function matches(article: DocSummary, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [article.title, article.summary, ...article.keywords]
    .join(' ')
    .toLowerCase()
  return q.split(/\s+/).every((term) => haystack.includes(term))
}

export function DocsIndexPage() {
  const [query, setQuery] = useState('')
  const articles = useMemo(() => docIndex(), [])
  const results = articles.filter((article) => matches(article, query))

  return (
    <div className={styles.indexPage}>
      <header className={styles.indexHeader}>
        <h1 className={styles.indexTitle}>Documentation</h1>
        <p className={styles.indexLede}>
          Guides for every part of Mockup Studio — {articles.length} articles.
        </p>
        <div className={styles.search}>
          <Icon name="sliders" size={14} className={styles.searchIcon} />
          <TextInput
            value={query}
            onChange={setQuery}
            label="Search documentation"
            placeholder="Search the docs…"
          />
        </div>
      </header>

      {results.length === 0 ? (
        <p className={styles.empty}>
          Nothing matches “{query}”. Try a different word.
        </p>
      ) : (
        DOC_SECTIONS.map((section) => {
          const inSection = results.filter((a) => a.section === section)
          if (inSection.length === 0) return null
          return (
            <section key={section} className={styles.section} id={section}>
              <h2 className={styles.sectionTitle}>{DOC_SECTION_LABELS[section]}</h2>
              <div className={styles.cards}>
                {inSection.map((article) => (
                  <Link
                    key={article.slug}
                    to={docPath(article.slug)}
                    className={cx(styles.card)}
                  >
                    <span className={styles.cardTitle}>{article.title}</span>
                    <span className={styles.cardSummary}>{article.summary}</span>
                    <span className={styles.cardMeta}>
                      {article.readMinutes} min read
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
