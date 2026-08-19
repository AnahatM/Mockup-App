import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { cx } from '@/lib/cx'
import styles from './DocMarkdown.module.css'

/**
 * The article renderer.
 *
 * `react-markdown` alone renders CommonMark, which does not include tables — and
 * a manual without tables is a manual full of pipe characters. `remark-gfm`
 * fixes that; `rehype-slug` gives every heading an id, which is what makes the
 * contents rail and deep links to a section possible.
 *
 * The overrides each exist for a reason a plain renderer gets wrong: a wide
 * table scrolls inside its own box rather than pushing the page sideways,
 * internal links route rather than reloading the app, and external links are
 * checked before they are rendered.
 */
const COMPONENTS: Components = {
  table: ({ children }) => (
    <div className={styles.tableWrap} role="region" tabIndex={0} aria-label="Table">
      <table className={styles.table}>{children}</table>
    </div>
  ),

  blockquote: ({ children }) => <blockquote className={styles.quote}>{children}</blockquote>,

  a: ({ href, children }) => {
    if (href?.startsWith('/')) {
      return (
        <Link to={href} className={cx(styles.link)}>
          {children}
        </Link>
      )
    }
    if (href?.startsWith('#')) {
      return (
        <a href={href} className={styles.link}>
          {children}
        </a>
      )
    }
    // Only http(s) is rendered as a link. A `javascript:` href executes, and
    // while every article here is authored in-repo, this is the renderer any
    // future untrusted markdown would reach.
    const safe = href && /^https?:\/\//i.test(href) ? href : null
    if (!safe) return <>{children}</>
    return (
      <a className={styles.link} href={safe} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    )
  },
}

export function DocMarkdown({ children }: { children: string }) {
  return (
    <div className={styles.prose}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={COMPONENTS}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
