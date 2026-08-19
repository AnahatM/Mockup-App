import { NavLink } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { ThemeSwitch } from '@/features/theme'
import { Icon } from '@/ui'
import { LINKS, ROUTES, navRoutes } from '../routes'
import { iconForRoute } from './routeIcons'
import styles from './Navbar.module.css'

/**
 * Site navigation.
 *
 * Present on every page *including* the studio. The studio's own controls live
 * on a second bar underneath this one, so moving between the tool and the site
 * never moves the app's identity or its navigation out from under the user.
 */
export function Navbar() {
  return (
    <header className={styles.bar}>
      <NavLink to={ROUTES.home} className={cx(styles.brand)}>
        <Icon name="phone" size={16} className={styles.brandIcon} />
        Mockup Studio
      </NavLink>

      <nav className={styles.links} aria-label="Main">
        {navRoutes().map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) => cx(styles.link, isActive && styles.active)}
          >
            <Icon name={iconForRoute(route.path)} size={14} />
            {route.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.actions}>
        <ThemeSwitch className={styles.theme} />
        <a
          className={cx(styles.source)}
          href={LINKS.repo}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Icon name="github" size={14} />
          Source
        </a>
      </div>
    </header>
  )
}
