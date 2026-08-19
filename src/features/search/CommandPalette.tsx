import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@/ui'
import { useAppStore } from '@/state/store'
import { PaletteResults } from './PaletteResults'
import { orderedItems, rankItems } from './rank'
import { useSearchIndex } from './useSearchIndex'
import type { SearchItem } from './types'
import styles from './CommandPalette.module.css'

/**
 * Search across every setting, device, preset, page and documentation article.
 *
 * The app has several hundred controls spread over eight panels. Search is how
 * that stops being a problem: type the name of the thing, land on it.
 */
export function CommandPalette() {
  const open = useAppStore((state) => state.ui.paletteOpen)
  if (!open) return null
  // Mounted only while open, so the query and cursor reset on every open
  // without an effect having to clear them.
  return <Palette />
}

function Palette() {
  const setOpen = useAppStore((state) => state.setPaletteOpen)
  const index = useSearchIndex()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)

  const results = useMemo(() => orderedItems(rankItems(index, query)), [index, query])

  const choose = useCallback(
    (item: SearchItem | undefined) => {
      if (!item) return
      setOpen(false)
      if (item.path) navigate(item.path)
      else item.run?.()
    },
    [navigate, setOpen],
  )

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') return setOpen(false)
    if (event.key === 'Enter') return choose(results[cursor])
    const step = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    setCursor((current) => wrap(current + step, results.length))
  }

  /** A new query invalidates the old cursor position. */
  const onQueryChange = (next: string) => {
    setQuery(next)
    setCursor(0)
  }

  return (
    <div
      className={styles.scrim}
      role="presentation"
      onClick={(event) => event.target === event.currentTarget && setOpen(false)}
    >
      <div
        className={styles.palette}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className={styles.searchRow}>
          <Icon name="sliders" size={15} className={styles.searchIcon} />
          <input
            className={styles.input}
            type="text"
            autoFocus
            placeholder="Search settings, devices, presets and docs…"
            aria-label="Search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className={styles.kbd}>Esc</kbd>
        </div>

        <PaletteResults results={results} cursor={cursor} onChoose={choose} />
      </div>
    </div>
  )
}

/** Wraps the cursor round the ends, so arrowing past the last item is not a dead end. */
function wrap(index: number, length: number): number {
  if (length === 0) return 0
  return (index + length) % length
}
