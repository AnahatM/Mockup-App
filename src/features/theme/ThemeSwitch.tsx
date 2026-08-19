import { SegmentedControl } from '@/ui'
import { useTheme } from './useTheme'
import type { ThemeMode } from './theme'

const SEGMENTS = [
  { value: 'light', icon: 'sun', title: 'Light' },
  { value: 'dark', icon: 'moon', title: 'Dark' },
  { value: 'system', icon: 'monitor', title: 'Match system' },
] as const satisfies ReadonlyArray<{
  value: ThemeMode
  icon: 'sun' | 'moon' | 'monitor'
  title: string
}>

/** Light / dark / system switch for the toolbar. */
export function ThemeSwitch({ className }: { className?: string | undefined }) {
  const { mode, setMode } = useTheme()
  return (
    <SegmentedControl
      value={mode}
      onChange={setMode}
      segments={SEGMENTS}
      label="Theme"
      className={className}
    />
  )
}
