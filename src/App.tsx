import styles from './App.module.css'

/**
 * P0 placeholder. Replaced by the real application shell in P1 — its only job
 * right now is to prove the token pipeline, CSS Modules and strict TS all work
 * end to end. See docs/PLAN.md.
 */
export function App() {
  return (
    <main className={styles.boot}>
      <h1 className={styles.title}>Mockup Studio</h1>
      <p className={styles.subtitle}>
        Foundation ready — tokens, strict TypeScript and lint guards are in place.
      </p>
    </main>
  )
}
