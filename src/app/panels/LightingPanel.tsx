import { Button, IconButton, Panel } from '@/ui'
import { ControlList, choice, slider } from '@/ui/controls'
import type { Control } from '@/ui/controls'
import {
  LIGHTING_PRESETS,
  applyLightingPreset,
  findLightingPreset,
} from '@/features/lighting'
import { useAppStore } from '@/state/store'
import type { AppState } from '@/state/types'
import { lightControls } from './lightControls'
import { roomControls } from './roomControls'
import styles from './LightingPanel.module.css'

const PRESET_OPTIONS = [
  ...LIGHTING_PRESETS.map((preset) => ({ value: preset.id, label: preset.label })),
  { value: 'custom', label: 'Custom' },
]

const rigControls: readonly Control<AppState>[] = [
  choice({
    label: 'Preset',
    options: PRESET_OPTIONS,
    select: (s) => s.lighting.preset,
    update: (d, v) => {
      const preset = findLightingPreset(v)
      if (preset) d.lighting = applyLightingPreset(preset)
    },
  }),
  slider({
    label: 'Environment',
    hint: 'Strength of the reflections the rig casts.',
    min: 0,
    max: 5,
    step: 0.01,
    select: (s) => s.lighting.environmentIntensity,
    update: (d, v) => {
      d.lighting.environmentIntensity = v
    },
  }),
  slider({
    label: 'Ambient',
    hint: 'Soft fill so unlit faces never crush to black.',
    min: 0,
    max: 3,
    step: 0.01,
    select: (s) => s.lighting.ambient,
    update: (d, v) => {
      d.lighting.ambient = v
    },
  }),
]

export function LightingPanel() {
  const lights = useAppStore((state) => state.lighting.lights)
  const addLight = useAppStore((state) => state.addLight)
  const removeLight = useAppStore((state) => state.removeLight)
  const duplicateLight = useAppStore((state) => state.duplicateLight)

  return (
    <>
      <Panel title="Rig">
        <ControlList controls={rigControls} />
      </Panel>

      <Panel title="Room">
        <ControlList controls={roomControls} />
      </Panel>

      {lights.map((light, index) => (
        <Panel
          key={light.id}
          title={light.name}
          defaultOpen={false}
          actions={
            <>
              <IconButton
                icon="copy"
                size="sm"
                label={`Duplicate ${light.name}`}
                onClick={() => duplicateLight(light.id)}
              />
              <IconButton
                icon="trash"
                size="sm"
                label={`Delete ${light.name}`}
                onClick={() => removeLight(light.id)}
              />
            </>
          }
        >
          <ControlList controls={lightControls(index)} />
        </Panel>
      ))}

      <div className={styles.footer}>
        <Button
          icon="plus"
          size="sm"
          fullWidth
          disabled={lights.length >= 8}
          onClick={addLight}
        >
          Add light
        </Button>
      </div>
    </>
  )
}
