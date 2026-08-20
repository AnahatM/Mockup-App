import { Link } from 'react-router-dom'
import { EmptyState, Icon, type IconName } from '@/ui'
import { ROUTES, SITE_ROUTES } from '../routes'
import styles from './NotFoundPage.module.css'

/** Icon for each route, keyed by path — mirrors the footer's own map. */
const ROUTE_ICONS: Record<string, IconName> = {
  [ROUTES.home]: 'home',
  [ROUTES.studio]: 'monitor',
  [ROUTES.docs]: 'book',
  [ROUTES.about]: 'info',
  [ROUTES.privacy]: 'shield',
  [ROUTES.sitemap]: 'map',
}

/**
 * A real destination for a broken or outdated link, not a dead end.
 *
 * Reads its link list from `SITE_ROUTES` — the same table the navbar, footer
 * and sitemap page use — so it can never drift into recommending a page that
 * no longer exists.
 */
export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <EmptyState
        icon="map"
        title="Page not found"
        description="That page does not exist. It may have moved, or the link may be wrong."
        action={
          <Link to={ROUTES.home} className={styles.home}>
            <Icon name="home" size={14} />
            Back to home
          </Link>
        }
      />

      <nav className={styles.grid} aria-label="Main destinations">
        {SITE_ROUTES.map((route) => (
          <Link key={route.path} to={route.path} className={styles.card}>
            <Icon name={ROUTE_ICONS[route.path] ?? 'dots'} size={16} className={styles.cardIcon} />
            <span className={styles.cardBody}>
              <span className={styles.cardTitle}>{route.label}</span>
              <span className={styles.cardSummary}>{route.summary}</span>
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
