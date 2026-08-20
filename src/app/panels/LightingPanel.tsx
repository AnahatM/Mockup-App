import { Button, EmptyState, IconButton, Panel } from '@/ui'
import { ControlList } from '@/ui/controls'
import { useAppStore } from '@/state/store'
import { lightControls } from './lightControls'
import { rigControls } from './lightingRigControls'
import { roomControls } from './roomControls'
import styles from './LightingPanel.module.css'

/** The lighting rig: the room, and each light as its own collapsible section. */
export function LightingPanel() {
  const lights = useAppStore((state) => state.lighting.lights)
  const addLight = useAppStore((state) => state.addLight)
  const removeLight = useAppStore((state) => state.removeLight)
  const duplicateLight = useAppStore((state) => state.duplicateLight)
  const selectedLightId = useAppStore((state) => state.selectedLightId)

  return (
    <>
      <Panel title="Rig">
        <ControlList controls={rigControls} />
      </Panel>

      <Panel title="Room">
        <ControlList controls={roomControls} />
      </Panel>

      {lights.length === 0 && (
        <EmptyState
          icon="light"
          title="No lights"
          description="The scene is lit only by the room. Add a light to shape highlights, rim edges and reflections."
        />
      )}

      {lights.map((light, index) => (
        <Panel
          key={light.id}
          title={light.name}
          defaultOpen={false}
          className={light.id === selectedLightId ? styles.selected : undefined}
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
