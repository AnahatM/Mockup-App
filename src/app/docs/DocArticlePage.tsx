import { Link, useParams } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { EmptyState } from '@/ui'
import { DOC_ARTICLES, DOC_SECTION_LABELS, findArticle, summarise } from '@/content/docs'
import { ROUTES, docPath } from '../routes'
import { DocMarkdown } from './DocMarkdown'
import { DocsSidebar } from './DocsSidebar'
import styles from './Docs.module.css'

export function DocArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = slug ? findArticle(slug) : undefined

  if (!article) {
    return (
      <div className={styles.notFound}>
        <EmptyState
          icon="close"
          title="No such article"
          description="That documentation page does not exist."
        />
        <Link to={ROUTES.docs} className={cx(styles.backLink)}>
          Back to the documentation
        </Link>
      </div>
    )
  }

  // Prev/next walk the manual in reading order, so it reads as a book.
  const position = DOC_ARTICLES.findIndex((a) => a.slug === article.slug)
  const previous = DOC_ARTICLES[position - 1]
  const next = DOC_ARTICLES[position + 1]

  return (
    <div className={styles.layout}>
      <aside className={styles.rail}>
        <DocsSidebar activeSlug={article.slug} />
      </aside>

      <article className={styles.article}>
        <p className={styles.breadcrumb}>
          <Link to={ROUTES.docs} className={cx(styles.backLink)}>
            Documentation
          </Link>
          {' · '}
          {DOC_SECTION_LABELS[article.section]}
          {' · '}
          {summarise(article).readMinutes} min read
        </p>

        <h1 className={styles.articleTitle}>{article.title}</h1>
        <p className={styles.articleSummary}>{article.summary}</p>

        <DocMarkdown>{article.body}</DocMarkdown>

        {article.related && article.related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>Related</h2>
            <div className={styles.relatedLinks}>
              {article.related.map((relatedSlug) => {
                const target = findArticle(relatedSlug)
                if (!target) return null
                return (
                  <Link
                    key={relatedSlug}
                    to={docPath(relatedSlug)}
                    className={cx(styles.relatedLink)}
                  >
                    {target.title}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        <nav className={styles.pager} aria-label="Article navigation">
          {previous ? (
            <Link to={docPath(previous.slug)} className={cx(styles.pagerLink)}>
              ← {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to={docPath(next.slug)}
              className={cx(styles.pagerLink, styles.pagerNext)}
            >
              {next.title} →
            </Link>
          )}
        </nav>
      </article>
    </div>
  )
}
