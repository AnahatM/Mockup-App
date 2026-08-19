import { Grid } from '@react-three/drei'
import type { BackdropConfig } from '../schema'

/**
 * Technical-drawing floor. Fades out with distance so it reads as infinite
 * rather than as a visible square that ends.
 */
export function GridFloor({ config }: { config: BackdropConfig }) {
  return (
    <Grid
      position={[0, 0, 0]}
      args={[40, 40]}
      cellSize={config.gridSize}
      cellThickness={0.6}
      cellColor={config.accent}
      sectionSize={config.gridSize * 5}
      sectionThickness={1}
      sectionColor={config.accent}
      fadeDistance={26}
      fadeStrength={1.4}
      infiniteGrid
      side={2}
    />
  )
}
