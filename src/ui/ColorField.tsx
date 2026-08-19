import { useCallback, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { cx } from '@/lib/cx'
import { normalizeHex } from '@/lib/color/hex'
import { useDismiss } from './hooks/useDismiss'
import styles from './ColorField.module.css'

export interface ColorFieldProps {
  value: string
  onChange: (hex: string) => void
  label?: string | undefined
  disabled?: boolean | undefined
  className?: string | undefined
}

/**
 * Hex colour input with a swatch that opens a picker.
 *
 * The swatch is the only place in the app where a literal colour reaches the DOM,
 * and it does so as inline style from user data rather than from a stylesheet —
 * which is exactly why the stylelint colour ban does not conflict with it.
 */
export function ColorField({
  value,
  onChange,
  label,
  disabled = false,
  className,
}: ColorFieldProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useDismiss(
    wrapRef,
    open,
    useCallback(() => setOpen(false), []),
  )

  const commitText = (raw: string) => {
    setDraft(null)
    const hex = normalizeHex(raw)
    if (hex) onChange(hex)
  }

  return (
    <div ref={wrapRef} className={cx(styles.wrap, className)}>
      <div className={cx(styles.field, disabled && styles.disabled)}>
        <button
          type="button"
          className={styles.swatch}
          style={{ background: value }}
          disabled={disabled}
          aria-label={label ? `${label} — choose colour` : 'Choose colour'}
          aria-expanded={open}
          onClick={() => setOpen((wasOpen) => !wasOpen)}
        />
        <input
          type="text"
          className={styles.text}
          spellCheck={false}
          value={draft ?? value}
          disabled={disabled}
          aria-label={label}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onBlur={(event) => commitText(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
            if (event.key === 'Escape') setDraft(null)
          }}
        />
      </div>
      {open && !disabled && (
        <div className={styles.popover}>
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}
    </div>
  )
}
