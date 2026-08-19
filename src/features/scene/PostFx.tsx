import {
  Bloom,
  N8AO,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { Vector2 } from 'three'
import { useAppStore } from '@/state/store'

/**
 * Post-processing stack. Bloom is what turns bright rim lights into visible
 * glow, which is most of the "shiny product render" look.
 *
 * Tone mapping lives HERE rather than on the renderer, and the composer is
 * always mounted as a result. three.js only applies `renderer.toneMapping` on
 * the final output pass, so once a composer renders the scene into a render
 * target the renderer's tone mapping is bypassed entirely — which silently made
 * the exposure control do nothing. Running it as the last effect also means
 * bloom sees real HDR values instead of already-clipped ones.
 */
export function PostFx() {
  const post = useAppStore((state) => state.scene.post)

  return (
    <EffectComposer enableNormalPass={false}>
      {/* Ambient occlusion first, on the raw scene. This is what makes a camera
          bump read as sitting ON the back panel rather than printed onto it,
          and what gives chamfers and seams their edge without a rim light. */}
      {post.aoEnabled ? (
        <N8AO
          aoRadius={post.aoRadius}
          intensity={post.aoIntensity}
          distanceFalloff={0.6}
          quality="medium"
          halfRes
        />
      ) : (
        <></>
      )}
      {post.bloomEnabled ? (
        <Bloom
          intensity={post.bloomIntensity}
          luminanceThreshold={post.bloomThreshold}
          luminanceSmoothing={post.bloomSmoothing}
          mipmapBlur
        />
      ) : (
        <></>
      )}
      {post.depthOfFieldEnabled ? (
        <DepthOfField
          focusDistance={post.focusDistance}
          focalLength={post.focalLength}
          bokehScale={post.bokehScale}
        />
      ) : (
        <></>
      )}
      {post.chromaticAberration > 0 ? (
        <ChromaticAberration
          offset={new Vector2(post.chromaticAberration, post.chromaticAberration)}
        />
      ) : (
        <></>
      )}
      {post.vignetteEnabled ? (
        <Vignette darkness={post.vignetteDarkness} eskil={false} />
      ) : (
        <></>
      )}
      {/* Must stay last: everything above works in linear HDR. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
