import { useNavigate } from 'react-router-dom'
import { Button, Icon, type ButtonVariant, type IconName } from '@/ui'
import styles from './ErrorScreen.module.css'

export interface ErrorAction {
  label: string
  icon?: IconName | undefined
  variant?: ButtonVariant | undefined
  onClick?: () => void
  /** Internal route to navigate to, as an alternative to `onClick`. */
  to?: string
}

export interface ErrorScreenProps {
  icon: IconName
  title: string
  description: string
  actions: readonly ErrorAction[]
  /** Extra reassurance shown under the actions, e.g. about local data. */
  note?: string | undefined
  /** Raw error text, shown only behind a disclosure and only in development. */
  detail?: string | undefined
}

/**
 * The calm, full-page failure state shared by the route-level error boundary
 * and the studio-level one. `role="alert"` because both are always an
 * interruption the user did not ask for — unlike `NotFoundPage`, which is a
 * normal, expected destination and stays out of this component entirely.
 */
export function ErrorScreen({
  icon,
  title,
  description,
  actions,
  note,
  detail,
}: ErrorScreenProps) {
  const navigate = useNavigate()

  return (
    <div className={styles.page} role="alert">
      <div className={styles.card}>
        <span className={styles.brand}>
          <Icon name="phone" size={15} />
          Mockup Studio
        </span>
        <Icon name={icon} size={26} className={styles.icon} />
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>

        <div className={styles.actions}>
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant ?? 'default'}
              icon={action.icon}
              onClick={action.onClick ?? (() => navigate(action.to ?? '/'))}
            >
              {action.label}
            </Button>
          ))}
        </div>

        {note && <p className={styles.note}>{note}</p>}

        {detail && (
          <details className={styles.details}>
            <summary>Error details (development only)</summary>
            <pre className={styles.stack}>{detail}</pre>
          </details>
        )}
      </div>
    </div>
  )
}
