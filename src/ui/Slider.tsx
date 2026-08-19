import { cx } from '@/lib/cx'
import styles from './Slider.module.css'

export interface SliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number | undefined
  disabled?: boolean | undefined
  label?: string | undefined
  className?: string | undefined
}

/**
 * Built on a native range input, so keyboard stepping, page-up/down and
 * assistive-technology announcements come from the platform rather than from us.
 * The filled portion of the track is driven by a CSS custom property.
 */
export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  label,
  className,
}: SliderProps) {
  const span = max - min
  const progress = span === 0 ? 0 : (value - min) / span

  return (
    <input
      type="range"
      className={cx(styles.slider, className)}
      style={{ '--progress': `${progress * 100}%` } as React.CSSProperties}
      value={value}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      aria-label={label}
      onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
    />
  )
}
