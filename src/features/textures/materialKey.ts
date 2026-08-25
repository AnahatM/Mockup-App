/**
 * A React key that changes when a material gains or loses its texture maps.
 *
 * three.js decides which shader to compile from which map *slots are filled*,
 * not from their contents: `roughnessMap` going from `null` to a texture needs
 * `USE_ROUGHNESSMAP` compiled in, and that only happens on `needsUpdate`.
 * React Three Fiber sets the prop and nothing else, so a material that mounted
 * without maps keeps its mapless program forever — the texture is assigned,
 * uploaded, and silently ignored.
 *
 * Verified in React Three Fiber's own source: its `applyProps` sets no
 * `needsUpdate` anywhere, so nothing else is doing it.
 *
 * Devices escape it by accident — `FinishMaterial` falls back to the finish's
 * automatic roughness map rather than to null, so that slot is never empty —
 * but their *normal* slot is, and the pedestal, the tile fields and the built
 * room all mount with `kind: 'none'` in every slot.
 *
 * Honest scope: this is a latent correctness fix, not a cure for anything
 * currently visible. It was written while chasing a pedestal whose procedural
 * texture produces no pixel change at all, and it did not move that symptom —
 * the plinth turns out to be almost entirely hidden behind the device and
 * under the contact shadow at the default camera, so nothing painted on it can
 * register either way. See CHECKLIST R14.
 *
 * Keying the material on the *presence* of maps rebuilds it exactly when the
 * program has to change, and leaves it alone when only the pattern changes —
 * swapping one texture object for another needs no recompile.
 */
export const mapsKey = (overlay: unknown): 'textured' | 'plain' =>
  overlay ? 'textured' : 'plain'
