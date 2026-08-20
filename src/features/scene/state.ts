/**
 * The pure half of the scene feature: data and maths, no React, no three.js.
 *
 * Mirrors `devices/state.ts` and exists for the same reason. The store needs
 * `deriveBackdrops`; it does not need `<SceneCanvas>`. Importing through
 * `index.ts` — which also exports react-three-fiber components — would pull
 * three.js into anything that touches the store, which is every component in
 * the app. See ADR 0006.
 *
 * Anything exported here must stay free of React and three.js components.
 */
export { deriveBackdrops, type AdaptiveBackdrop } from './backdrop/adaptive'
