import { useRef, useState } from 'react'
import { Button, EmptyState, IconButton, Panel, TextInput, useConfirm } from '@/ui'
import { importManifest } from '@/features/presets'
import { useAppStore } from '@/state/store'
import { useBusy } from '@/state/useBusy'
import styles from './PresetsPanel.module.css'

/**
 * The user's own presets: save the current scene, apply, export, import.
 *
 * Saved presets carry the scene but not the screenshot, so they are a look you
 * apply to whatever you have open. File export is where a self-contained,
 * media-embedded copy lives.
 */
export function SavedPresets() {
  const presets = useAppStore((state) => state.presets)
  const error = useAppStore((state) => state.presetError)
  const savePreset = useAppStore((state) => state.savePreset)
  const setError = useAppStore((state) => state.setPresetError)
  const loadManifest = useAppStore((state) => state.loadManifest)

  const busy = useBusy()
  const [name, setName] = useState('')
  const input = useRef<HTMLInputElement>(null)

  const onImport = async (file: File | undefined) => {
    if (!file) return
    const result = await busy(() => importManifest(file))
    if (result.ok) loadManifest(result.value)
    else setError(result.error)
  }

  return (
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
        <PresetList />
      )}

      <input
        ref={input}
        type="file"
        accept=".json,application/json"
        className={styles.fileInput}
        onChange={(event) => void onImport(event.currentTarget.files?.[0])}
      />
      <Button icon="upload" size="sm" fullWidth onClick={() => input.current?.click()}>
        Import preset file
      </Button>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </Panel>
  )
}

function PresetList() {
  const presets = useAppStore((state) => state.presets)
  const applyPreset = useAppStore((state) => state.applyPreset)
  const deletePreset = useAppStore((state) => state.deletePreset)
  const duplicatePreset = useAppStore((state) => state.duplicatePreset)
  const downloadPreset = useAppStore((state) => state.downloadPreset)
  const { confirm, dialog } = useConfirm()

  /** Deleting a saved look is unrecoverable — there is no undo for local storage. */
  const askThenDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: `Delete "${name}"?`,
      description: 'This removes the preset from this browser. It cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
    })
    if (ok) deletePreset(id)
  }

  return (
    <>
      <ul className={styles.list}>
        {presets.map((preset) => (
          <li key={preset.id} className={styles.row}>
            <button
              type="button"
              className={styles.apply}
              aria-label={`Apply ${preset.name}`}
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
              onClick={() => void askThenDelete(preset.id, preset.name)}
            />
          </li>
        ))}
      </ul>
      {dialog}
    </>
  )
}
