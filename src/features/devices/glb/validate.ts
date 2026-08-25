/**
 * Checks that a file really is a model before it reaches the loader.
 *
 * The picker used to check the extension and nothing else, so anything named
 * `.glb` was handed straight to three.js. A corrupt one did surface a message
 * in the panel — `GlbErrorBoundary` catches the suspense throw — but the
 * loader's own rejection still escaped to the page as an unhandled error,
 * which is noise at best and trips error reporting at worst.
 *
 * Reading the header instead means a bad file never reaches the loader at all,
 * and the message says what is actually wrong with it rather than relaying a
 * JSON parse error about a blob URL.
 *
 * Only the first twelve bytes are read for a `.glb`, so this costs nothing on
 * a 200MB model.
 */

/** `glTF`, little-endian — the first four bytes of every binary glTF. */
const GLB_MAGIC = 0x46546c67

/** The only container version in the wild. glTF 1.0 was superseded in 2017 and
 *  three.js's loader does not read it. */
const GLB_VERSION = 2

/** Header is magic, version and total length: three 32-bit words. */
const GLB_HEADER_BYTES = 12

/** Returns a message to show the user, or null if the file looks loadable. */
export async function validateModelFile(file: File): Promise<string | null> {
  if (!/\.(glb|gltf)$/i.test(file.name)) {
    return 'Models must be a .glb or .gltf file.'
  }

  return /\.glb$/i.test(file.name) ? validateBinary(file) : validateJson(file)
}

async function validateBinary(file: File): Promise<string | null> {
  const header = await file.slice(0, GLB_HEADER_BYTES).arrayBuffer()
  if (header.byteLength < GLB_HEADER_BYTES) {
    return `${file.name} is too small to be a model.`
  }

  const view = new DataView(header)
  if (view.getUint32(0, true) !== GLB_MAGIC) {
    return `${file.name} is not a binary glTF file — it is named .glb but does not contain a model.`
  }

  const version = view.getUint32(4, true)
  if (version !== GLB_VERSION) {
    return `${file.name} is glTF version ${version}; this reads version ${GLB_VERSION}.`
  }

  return null
}

async function validateJson(file: File): Promise<string | null> {
  try {
    // A `.gltf` is a JSON document, so parsing it is the whole check — and it
    // is the same parse the loader would have failed on, done somewhere the
    // failure can be explained.
    JSON.parse(await file.text())
    return null
  } catch {
    return `${file.name} is not valid glTF JSON.`
  }
}
