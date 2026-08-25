// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { validateModelFile } from './validate'

/**
 * A corrupt import surfaced a message in the device panel — the error boundary
 * around the loader saw to that — but three.js's own rejection still escaped to
 * the page as an unhandled error. The extension was the only thing checked, so
 * anything at all named `.glb` was handed to the loader.
 */

/** A minimal, valid binary glTF header: magic, version 2, and a length. */
function glbHeader(magic = 0x46546c67, version = 2): ArrayBuffer {
  const buffer = new ArrayBuffer(12)
  const view = new DataView(buffer)
  view.setUint32(0, magic, true)
  view.setUint32(4, version, true)
  view.setUint32(8, 12, true)
  return buffer
}

const file = (name: string, content: BlobPart): File => new File([content], name)

describe('model file validation', () => {
  it('accepts a real binary glTF header', async () => {
    expect(await validateModelFile(file('scene.glb', glbHeader()))).toBeNull()
  })

  it('rejects something merely named .glb', async () => {
    const message = await validateModelFile(file('scene.glb', 'not a real glb file'))
    expect(message).toContain('does not contain a model')
  })

  it('rejects a file too short to have a header', async () => {
    expect(await validateModelFile(file('scene.glb', 'glTF'))).toContain('too small')
  })

  it('names the version when it is one we do not read', async () => {
    // glTF 1.0 was superseded in 2017 and three.js's loader will not read it,
    // so saying so beats letting the loader fail on it.
    const message = await validateModelFile(file('old.glb', glbHeader(0x46546c67, 1)))
    expect(message).toContain('version 1')
  })

  it('accepts a .gltf that parses as JSON, and rejects one that does not', async () => {
    expect(await validateModelFile(file('scene.gltf', '{"asset":{}}'))).toBeNull()
    expect(await validateModelFile(file('scene.gltf', '{oh dear'))).toContain(
      'not valid glTF JSON',
    )
  })

  it('rejects anything that is not a model at all', async () => {
    expect(await validateModelFile(file('photo.png', 'x'))).toContain(
      '.glb or .gltf',
    )
  })
})
