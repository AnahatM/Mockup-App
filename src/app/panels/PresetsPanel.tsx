import { useRef, useState } from 'react'
import { Button, EmptyState, IconButton, Panel, TextInput } from '@/ui'
import { BUILTIN_PRESETS, importManifest } from '@/features/presets'
import { useAppStore } from '@/state/store'
import styles from './PresetsPanel.module.css'

/**
 * Saved and premade looks.
 *
 * Saved presets carry the scene, not the screenshot, so they are a look you
 * apply to whatever you have open. File export is where a self-contained,
 * media-embedded copy lives.
 */
export function PresetsPanel() {
  const presets = useAppStore((state) => state.presets)
  const error = useAppStore((state) => state.presetError)
  const savePreset = useAppStore((state) => state.savePreset)
  const applyBuiltin = useAppStore((state) => state.applyBuiltinPreset)
  const setError = useAppStore((state) => state.setPresetError)
  const loadManifest = useAppStore((state) => state.loadManifest)

  const [name, setName] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const onImport = async (file: File | undefined) => {
    if (!file) return
    const result = await importManifest(file)
    if (result.ok) loadManifest(result.value)
    else setError(result.error)
  }

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

      <Panel title="Saved">
        <div className={styles.saveRow}>
          <TextInput
            value={name}
            onChange={setName}
            label="Preset name"
            placeholder="Name this look"
            maxLength={60}
          />
          <Button
            icon="save"
            size="sm"
            onClick={() => {
              savePreset(name)
              setName('')
            }}
          >
            Save
          </Button>
        </div>

        {presets.length === 0 ? (
          <EmptyState
            icon="sparkle"
            title="No saved presets"
            description="Save the current scene to reuse it later, or import a .mockup.json file."
          />
        ) : (
          <SavedList />
        )}

        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          className={styles.fileInput}
          onChange={(event) => void onImport(event.currentTarget.files?.[0])}
        />
        <Button
          icon="upload"
          size="sm"
          fullWidth
          onClick={() => input.current?.click()}
        >
          Import preset file
        </Button>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </Panel>
    </>
  )
}

function SavedList() {
  const presets = useAppStore((state) => state.presets)
  const applyPreset = useAppStore((state) => state.applyPreset)
  const deletePreset = useAppStore((state) => state.deletePreset)
  const duplicatePreset = useAppStore((state) => state.duplicatePreset)
  const downloadPreset = useAppStore((state) => state.downloadPreset)

  return (
    <ul className={styles.list}>
      {presets.map((preset) => (
        <li key={preset.id} className={styles.row}>
          <button
            type="button"
            className={styles.apply}
            title={`Apply ${preset.name}`}
            onClick={() => applyPreset(preset.id)}
          >
            {preset.name}
          </button>
          <IconButton
            icon="download"
            size="sm"
            label={`Export ${preset.name}`}
            onClick={() => downloadPreset(preset.id)}
          />
          <IconButton
            icon="copy"
            size="sm"
            label={`Duplicate ${preset.name}`}
            onClick={() => duplicatePreset(preset.id)}
          />
          <IconButton
            icon="trash"
            size="sm"
            label={`Delete ${preset.name}`}
            onClick={() => deletePreset(preset.id)}
          />
        </li>
      ))}
    </ul>
  )
}
