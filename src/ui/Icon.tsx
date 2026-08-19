import { ICON_PATHS, type IconName } from './icons'

export interface IconProps {
  name: IconName
  /** Rendered size in px. Defaults to 16 — the density this tool UI is drawn at. */
  size?: number | undefined
  /** Accessible label. Omit for icons that sit next to their own visible text. */
  label?: string | undefined
  className?: string | undefined
}

/**
 * Single icon renderer. Icons are decorative by default and only join the
 * accessibility tree when given a `label`, which keeps screen-reader output
 * clean for buttons that already have text.
 */
export function Icon({ name, size = 16, label, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}
