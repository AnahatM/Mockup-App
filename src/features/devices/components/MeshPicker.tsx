import { Select } from '@/ui'
import { useAppStore } from '@/state/store'
import styles from './MeshPicker.module.css'

/**
 * Lets the user choose which mesh in an imported model receives the
 * screenshot. Auto-selected on load when a name obviously looks like a
 * screen (see `glb/screenHeuristic.ts`), but always changeable — a model may
 * not name its meshes helpfully, or the heuristic may simply be wrong.
 */
export function MeshPicker() {
  const glb = useAppStore((state) => state.device.glb)
  const setGlbScreenMesh = useAppStore((state) => state.setGlbScreenMesh)

  if (!glb || glb.meshNames.length === 0) return null

  const options = glb.meshNames.map((name) => ({ value: name, label: name }))

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>Screen mesh</span>
      <Select
        value={glb.screenMesh ?? glb.meshNames[0] ?? ''}
        onChange={setGlbScreenMesh}
        options={options}
        label="Screen mesh"
        className={styles.select}
      />
    </div>
  )
}
