/**
 * Render layers.
 *
 * three.js layers decide which objects a given camera draws, and this app needs
 * exactly one of them, for one reason: drei's `ContactShadows` bakes the *whole
 * scene* through `scene.overrideMaterial`, seen from an orthographic camera
 * sitting on the floor looking upward.
 *
 * Backdrop structures stand on that floor. Their undersides face that camera
 * directly, and a pulsating block lifts its underside right into the near end
 * of the camera's depth range — where the depth shader is at its most opaque.
 * They would be baked into the product's contact shadow as solid dark patches
 * that have nothing to do with the product.
 *
 * Keeping them on their own layer, which the viewport camera is told to draw
 * and the shadow camera is not, is precisely what layers are for. The
 * alternative was reimplementing the bake so it renders only the product
 * subtree, which is a great deal more code and more to keep correct.
 *
 * Layer 0 is three's default and holds everything else, the product included.
 */
export const BACKDROP_LAYER = 1
