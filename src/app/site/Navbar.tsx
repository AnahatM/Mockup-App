import { NavLink } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { ThemeSwitch } from '@/features/theme'
import { Icon } from '@/ui'
import { LINKS, navRoutes } from '../routes'
import styles from './Navbar.module.css'

/** Site navigation. Present on every page except the studio's own chrome. */
export function Navbar() {
  return (
    <header className={styles.bar}>
      <NavLink to="/" className={cx(styles.brand)}>
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
          <Icon name="copy" size={14} />
          Source
        </a>
      </div>
    </header>
  )
}
