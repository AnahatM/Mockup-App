import { Link } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { EmptyState } from '@/ui'
import { ROUTES } from '../routes'
import styles from './Prose.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <EmptyState
        icon="close"
        title="Page not found"
        description="That page does not exist. It may have moved, or the link may be wrong."
      />
      <p className={styles.body} style={{ textAlign: 'center' }}>
        <Link to={ROUTES.home} className={cx(styles.link)}>
          Back to the home page
        </Link>
        {' · '}
        <Link to={ROUTES.sitemap} className={cx(styles.link)}>
          See everything
        </Link>
      </p>
    </div>
  )
}
