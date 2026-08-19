import { LINKS } from '../routes'
import styles from './Prose.module.css'

/**
 * The privacy page.
 *
 * Short, because there is genuinely almost nothing to say: the app has no
 * server, so most of what a privacy policy usually covers does not exist here.
 * Padding it out with boilerplate about data we do not collect would obscure
 * that rather than communicate it.
 */
export function PrivacyPage() {
  return (
    <article className={styles.page}>
      <h1 className={styles.title}>Privacy</h1>
      <p className={styles.lede}>
        Mockup Studio has no server. Nothing you load into it is uploaded anywhere,
        because there is nowhere for it to go.
      </p>

      <section className={styles.section}>
        <h2 className={styles.heading}>What happens to your files</h2>
        <p className={styles.body}>
          Screenshots, screen recordings and environment maps are read directly by your
          browser and turned into textures on your GPU. They are never transmitted.
          Closing the tab discards them.
        </p>
        <p className={styles.body}>
          Exported images and videos are generated in the page and written straight to
          your downloads folder.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>What is stored on your device</h2>
        <div className={styles.list}>
          <p className={styles.item}>
            <span className={styles.strong}>Your theme preference</span>, so the app
            does not flash the wrong colours on load.
          </p>
          <p className={styles.item}>
            <span className={styles.strong}>Saved presets</span> — the scene settings
            you choose to save. These deliberately do not include your screenshot.
          </p>
        </div>
        <p className={styles.body}>
          Both live in your browser&rsquo;s local storage and can be removed by clearing
          site data. Neither is readable by anyone but you.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>No tracking</h2>
        <p className={styles.body}>
          There is no analytics, no telemetry, no error reporting, no cookies and no
          third-party scripts. The app makes no network requests at runtime at all — not
          for fonts, not for 3D assets, not for environment maps.
        </p>
        <p className={styles.body}>
          You can verify this rather than take it on trust: open your browser&rsquo;s
          network tab, or read the{' '}
          <a
            className={styles.link}
            href={LINKS.repo}
            target="_blank"
            rel="noreferrer noopener"
          >
            source code
          </a>
          .
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>If you host it yourself</h2>
        <p className={styles.body}>
          Whoever serves the files can see the ordinary request logs any web server
          keeps. That is between you and your host — the application itself sends
          nothing.
        </p>
      </section>
    </article>
  )
}
