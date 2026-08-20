import { Link } from 'react-router-dom'
import { cx } from '@/lib/cx'
import { DEVICES } from '@/features/devices/state'
import { BUILTIN_PRESETS } from '@/features/presets'
import { DOC_SECTIONS, DOC_SECTION_LABELS, docIndex } from '@/content/docs'
import { ROUTES, SITE_ROUTES, docPath } from '../routes'
import styles from './SitemapPage.module.css'
import { useDocumentTitle } from '../useDocumentTitle'

/**
 * Everything in Mockup Studio, on one page.
 *
 * Derived from the same registries the app itself uses — routes, the device
 * catalogue, the preset list, the manual — rather than hand-maintained. A
 * hand-written sitemap is a sitemap that quietly stops being true.
 */
export function SitemapPage() {
  useDocumentTitle('Sitemap')
  const articles = docIndex()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Sitemap</h1>
      <p className={styles.lede}>
        Everything in Mockup Studio, generated from what actually exists.
      </p>

      <section className={styles.band}>
        <h2 className={styles.bandTitle}>Pages</h2>
        <div className={styles.grid}>
          {SITE_ROUTES.map((route) => (
            <Link key={route.path} to={route.path} className={cx(styles.card)}>
              <span className={styles.cardTitle}>{route.label}</span>
              <span className={styles.cardBody}>{route.summary}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.band}>
        <h2 className={styles.bandTitle}>
          Documentation <span className={styles.count}>{articles.length}</span>
        </h2>
        {DOC_SECTIONS.map((section) => {
          const inSection = articles.filter((a) => a.section === section)
          if (inSection.length === 0) return null
          return (
            <div key={section} className={styles.group}>
              <h3 className={styles.groupTitle}>{DOC_SECTION_LABELS[section]}</h3>
              <div className={styles.links}>
                {inSection.map((article) => (
                  <Link
                    key={article.slug}
                    to={docPath(article.slug)}
                    className={cx(styles.link)}
                  >
                    {article.title}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <section className={styles.band}>
        <h2 className={styles.bandTitle}>
          Devices <span className={styles.count}>{DEVICES.length}</span>
        </h2>
        <div className={styles.links}>
          {DEVICES.map((device) => (
            <Link key={device.id} to={ROUTES.studio} className={cx(styles.link)}>
              {device.name}
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.band}>
        <h2 className={styles.bandTitle}>
          Presets <span className={styles.count}>{BUILTIN_PRESETS.length}</span>
        </h2>
        <div className={styles.links}>
          {BUILTIN_PRESETS.map((preset) => (
            <Link key={preset.id} to={ROUTES.studio} className={cx(styles.link)}>
              {preset.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
