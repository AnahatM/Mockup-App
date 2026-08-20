import { Panel } from '@/ui'
import { PresetThumbnail, builtinPresetGroups } from '@/features/presets'
import { useAppStore } from '@/state/store'
import { SavedPresets } from './SavedPresets'
import styles from './PresetsPanel.module.css'

/** Premade looks that ship with the app, plus the user's own saved presets. */
export function PresetsPanel() {
  const applyBuiltin = useAppStore((state) => state.applyBuiltinPreset)

  return (
    <>
      {builtinPresetGroups().map(({ group, presets }) => (
        <Panel key={group} title={group} defaultOpen={group === 'Studio'}>
          <div className={styles.list}>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={styles.builtin}
                onClick={() => applyBuiltin(preset.id)}
              >
                <PresetThumbnail preset={preset} />
                <span className={styles.text}>
                  <span className={styles.name}>{preset.name}</span>
                  <span className={styles.description}>{preset.description}</span>
                </span>
              </button>
            ))}
          </div>
        </Panel>
      ))}

      <SavedPresets />
    </>
  )
}
