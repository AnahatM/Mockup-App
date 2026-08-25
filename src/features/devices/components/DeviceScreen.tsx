import { useEffect, useMemo } from 'react'
import type { Texture } from 'three'
import { fitMedia } from '@/lib/media/fit'
import { useOverlayTexture } from '@/features/screen'
import { useAppStore } from '@/state/store'
import { SCREEN_FINISH_VALUES, type ScreenFinish } from '../materials/finishes'
import { buildScreen, screenLayout } from '../builders/screen'
import type { DeviceSpec } from '../spec/types'

export interface DeviceScreenProps {
  spec: DeviceSpec
  z: number
  texture: Texture | null
  /** Aspect ratio of the loaded media, for fitting. */
  mediaAspect: number
  /** How brightly the display self-illuminates. */
  brightness: number
  /** Glossy mirrors the room; matte is an anti-glare etch. */
  screenFinish: ScreenFinish
}

/**
 * The display: a base panel with the media drawn on a quad in front of it.
 *
 * Two layers rather than one, because `contain` has to leave the screen's own
 * background visible around the media. Scaling a texture below its plane would
 * clamp and smear the edge pixels instead of leaving a gap.
 *
 * The panel is emissive rather than unlit so it behaves like a real screen: it
 * glows at its own brightness *and* still picks up reflections from the rig,
 * which is what stops a mockup looking like a sticker.
 */
export function DeviceScreen({
  spec,
  z,
  texture,
  mediaAspect,
  brightness,
  screenFinish,
}: DeviceScreenProps) {
  const screen = useAppStore((state) => state.screen)
  const layout = useMemo(() => screenLayout(spec.body, spec.screen), [spec])
  const geometry = useMemo(() => buildScreen(layout), [layout])
  const overlay = useOverlayTexture(
    spec.supportedOverlays,
    layout.width / layout.height,
  )
  // Glossy glass mirrors the room; a matte etch scatters it. This is the single
  // most noticeable material choice on a device, because the screen is the
  // largest flat surface facing the camera.
  const glass = SCREEN_FINISH_VALUES[screenFinish]

  const placement = useMemo(
    () =>
      fitMedia({
        screenWidth: layout.width,
        screenHeight: layout.height,
        mediaAspect,
        mode: screen.fit,
        zoom: screen.zoom,
        panX: screen.panX,
        panY: screen.panY,
      }),
    [layout, mediaAspect, screen.fit, screen.zoom, screen.panX, screen.panY],
  )

  // Applying the crop to the texture rather than rebuilding it means panning and
  // zooming never restart a playing video.
  useEffect(() => {
    if (!texture) return
    texture.repeat.set(placement.repeat[0], placement.repeat[1])
    texture.offset.set(placement.offset[0], placement.offset[1])

    /*
     * This plane's UVs put the origin at the bottom left, which is what
     * `TextureLoader` flips an image for. An imported glTF mesh has the
     * opposite convention and clears this flag on the very same texture
     * object, so a device switched from an import back to a catalogue pick
     * would otherwise show the screenshot upside down. Whichever path is
     * mounted states what it needs — see `applyScreenTexture`.
     */
    texture.flipY = true
    texture.needsUpdate = true
  }, [texture, placement])

  return (
    <group position={[0, layout.offsetY, z]}>
      {/* Base panel: the switched-off display, and the letterbox in `contain`. */}
      <mesh geometry={geometry} renderOrder={1}>
        <meshPhysicalMaterial
          color={screen.background}
          emissive={screen.background}
          emissiveIntensity={texture ? 0.15 : 0.4}
          roughness={glass.roughness}
          clearcoat={glass.clearcoat}
          clearcoatRoughness={glass.clearcoatRoughness}
          metalness={0}
        />
      </mesh>

      {texture && (
        <mesh position={[0, 0, 0.02]} renderOrder={2}>
          <planeGeometry args={[placement.planeWidth, placement.planeHeight]} />
          <meshStandardMaterial
            map={texture}
            emissiveMap={texture}
            emissive="#ffffff"
            emissiveIntensity={brightness}
            color="#000000"
            roughness={0.16}
            metalness={0}
          />
        </mesh>
      )}

      {/* Status bar, gesture bar, menu bar and dock, composited as one layer in
          front of the media so they are independent of both it and the geometry. */}
      {overlay && (
        <mesh position={[0, 0, 0.04]} renderOrder={3}>
          <planeGeometry args={[layout.width, layout.height]} />
          <meshBasicMaterial map={overlay} transparent toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}
