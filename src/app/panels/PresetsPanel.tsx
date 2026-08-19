import { Panel } from '@/ui'
import { BUILTIN_PRESETS } from '@/features/presets'
import { useAppStore } from '@/state/store'
import { SavedPresets } from './SavedPresets'
import styles from './PresetsPanel.module.css'

/** Premade looks that ship with the app, plus the user's own saved presets. */
export function PresetsPanel() {
  const applyBuiltin = useAppStore((state) => state.applyBuiltinPreset)

  return (
    <>
      <Panel title="Premade">
        <div className={styles.list}>
          {BUILTIN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={styles.builtin}
              onClick={() => applyBuiltin(preset.id)}
            >
              <span className={styles.name}>{preset.name}</span>
              <span className={styles.description}>{preset.description}</span>
            </button>
          ))}
        </div>
      </Panel>

      <SavedPresets />
    </>
  )
}
