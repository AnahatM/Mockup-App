import { useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { ThemeSwitch } from '@/features/theme'
import { Icon, IconButton, useDismiss } from '@/ui'
import { LINKS, ROUTES, navRoutes } from '../routes'
import { iconForRoute } from './routeIcons'
import styles from './Navbar.module.css'

/**
 * Site navigation.
 *
 * Present on every page *including* the studio. The studio's own controls live
 * on a second bar underneath this one, so moving between the tool and the site
 * never moves the app's identity or its navigation out from under the user.
 *
 * Below the `mobile` breakpoint (see design-tokens.md) the links, theme switch
 * and source link do not fit next to the brand, so they collapse behind a menu
 * button instead of being trimmed one at a time — everything stays reachable,
 * just one tap further away.
 */
export function Navbar() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const close = () => setOpen(false)

  useDismiss(menuRef, open, close)

  return (
    <header className={styles.bar} ref={menuRef}>
      <NavLink to={ROUTES.home} className={cx(styles.brand)}>
        <Icon name="phone" size={16} className={styles.brandIcon} />
        Mockup Studio
      </NavLink>

      <nav className={cx(styles.links, open && styles.linksOpen)} aria-label="Main">
        {navRoutes().map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            // Following a link means the menu has done its job — close it
            // directly on the click that navigates, not via a route-change
            // effect (which would fire a redundant extra render).
            onClick={close}
            className={({ isActive }) => cx(styles.link, isActive && styles.active)}
          >
            <Icon name={iconForRoute(route.path)} size={14} />
            {route.label}
          </NavLink>
        ))}

        <div className={styles.menuDivider} aria-hidden="true" />

        <div className={styles.menuActions}>
          <ThemeSwitch className={styles.theme} />
          <a
            className={cx(styles.source)}
            href={LINKS.repo}
            target="_blank"
            rel="noreferrer noopener"
            onClick={close}
          >
            <Icon name="github" size={14} />
            <span>Source</span>
          </a>
        </div>
      </nav>

      <IconButton
        icon={open ? 'close' : 'menu'}
        label={open ? 'Close menu' : 'Open menu'}
        className={styles.menuButton}
        active={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      />
    </header>
  )
}
