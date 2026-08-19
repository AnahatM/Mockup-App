import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { TextInput } from '@/ui'
import { DOC_SECTIONS, DOC_SECTION_LABELS, docIndex } from '@/content/docs'
import { docPath } from '../routes'
import styles from './Docs.module.css'

/**
 * The manual's own navigation.
 *
 * The box at the top is a *filter*, not a search: it narrows this list in place
 * so the structure of the manual stays visible. Full search lives on the index
 * page and in the command palette.
 */
export function DocsSidebar({ activeSlug }: { activeSlug?: string }) {
  const [filter, setFilter] = useState('')
  const articles = docIndex()
  const needle = filter.trim().toLowerCase()

  const visible = articles.filter(
    (article) =>
      !needle ||
      article.title.toLowerCase().includes(needle) ||
      article.summary.toLowerCase().includes(needle) ||
      article.keywords.some((k) => k.toLowerCase().includes(needle)),
  )

  return (
    <nav className={styles.sidebar} aria-label="Documentation">
      <TextInput
        value={filter}
        onChange={setFilter}
        label="Filter articles"
        placeholder="Filter…"
      />

      {DOC_SECTIONS.map((section) => {
        const inSection = visible.filter((a) => a.section === section)
        if (inSection.length === 0) return null
        return (
          <div key={section} className={styles.navSection}>
            <h2 className={styles.navHeading}>{DOC_SECTION_LABELS[section]}</h2>
            <ul>
              {inSection.map((article) => (
                <li key={article.slug}>
                  <Link
                    to={docPath(article.slug)}
                    className={cx(
                      styles.navLink,
                      article.slug === activeSlug && styles.navActive,
                    )}
                    aria-current={article.slug === activeSlug ? 'page' : undefined}
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}
