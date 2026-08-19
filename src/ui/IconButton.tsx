import type { ButtonHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'
import { Icon } from './Icon'
import { Tooltip } from './Tooltip'
import type { IconName } from './icons'
import styles from './IconButton.module.css'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  /** Required — an icon-only control has no visible text to name it. */
  label: string
  size?: 'sm' | 'md' | undefined
  active?: boolean | undefined
  /** Suppresses the tooltip where the label would only restate nearby text. */
  quiet?: boolean | undefined
}

export function IconButton({
  icon,
  label,
  size = 'md',
  active = false,
  quiet = false,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const button = (
    <button
      type={type}
      aria-label={label}
      aria-pressed={active}
      className={cx(styles.button, styles[size], active && styles.active, className)}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 14 : 16} />
    </button>
  )

  return quiet ? button : <Tooltip label={label}>{button}</Tooltip>
}
