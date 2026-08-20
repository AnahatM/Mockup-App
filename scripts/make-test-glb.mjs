#!/usr/bin/env node
/**
 * Hand-builds a minimal, self-contained .glb for exercising the GLB import
 * feature end to end, without a network fetch or a bundled sample asset.
 *
 * three.js's GLTFExporter needs `FileReader`, a browser-only API not present
 * under plain Node — so rather than polyfilling a browser inside a build
 * script, this constructs the binary container by hand. It is a small model:
 * two nodes/meshes, "Body" (a box) and "Screen" (a flat quad standing proud
 * of it, UVs spanning the full 0-1 range), which is exactly what
 * importing-models.md asks an author to provide.
 *
 * Usage: node scripts/make-test-glb.mjs [out/path.glb]
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const out = process.argv[2] ?? 'scripts/out/test-model.glb'

// --- geometry ---------------------------------------------------------------

/** One box face: four corners (already scaled/positioned) plus its normal. */
function face(corners, normal) {
  const uvs = [
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0],
  ]
  return { corners, normal, uvs }
}

function boxFaces(w, h, d) {
  const x = w / 2
  const y = h / 2
  const z = d / 2
  return [
    face(
      [
        [x, -y, -z],
        [x, y, -z],
        [x, y, z],
        [x, -y, z],
      ],
      [1, 0, 0],
    ),
    face(
      [
        [-x, -y, z],
        [-x, y, z],
        [-x, y, -z],
        [-x, -y, -z],
      ],
      [-1, 0, 0],
    ),
    face(
      [
        [-x, y, -z],
        [-x, y, z],
        [x, y, z],
        [x, y, -z],
      ],
      [0, 1, 0],
    ),
    face(
      [
        [-x, -y, z],
        [-x, -y, -z],
        [x, -y, -z],
        [x, -y, z],
      ],
      [0, -1, 0],
    ),
    face(
      [
        [-x, -y, z],
        [x, -y, z],
        [x, y, z],
        [-x, y, z],
      ],
      [0, 0, 1],
    ),
    face(
      [
        [x, -y, -z],
        [-x, -y, -z],
        [-x, y, -z],
        [x, y, -z],
      ],
      [0, 0, -1],
    ),
  ]
}

/** Flattens a list of faces into position/normal/uv/index arrays. */
function buildMesh(faces) {
  const positions = []
  const normals = []
  const uvs = []
  const indices = []
  let base = 0

  for (const f of faces) {
    for (let i = 0; i < 4; i++) {
      positions.push(...f.corners[i])
      normals.push(...f.normal)
      uvs.push(...f.uvs[i])
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
    base += 4
  }

  return {
    positions: Float32Array.from(positions),
    normals: Float32Array.from(normals),
    uvs: Float32Array.from(uvs),
    indices: Uint16Array.from(indices),
    vertexCount: positions.length / 3,
    indexCount: indices.length,
  }
}

// --- binary packing -----------------------------------------------------

class BufferBuilder {
  chunks = []
  byteLength = 0

  /** Appends a typed array, 4-byte aligned, and returns its bufferView span. */
  add(typedArray) {
    const buf = Buffer.from(
      typedArray.buffer,
      typedArray.byteOffset,
      typedArray.byteLength,
    )
    const byteOffset = this.byteLength
    this.chunks.push(buf)
    this.byteLength += buf.length
    const pad = (4 - (this.byteLength % 4)) % 4
    if (pad) {
      this.chunks.push(Buffer.alloc(pad))
      this.byteLength += pad
    }
    return { buffer: 0, byteOffset, byteLength: buf.length }
  }

  build() {
    return Buffer.concat(this.chunks, this.byteLength)
  }
}

function minMax3(positions) {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < positions.length; i += 3) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], positions[i + axis])
      max[axis] = Math.max(max[axis], positions[i + axis])
    }
  }
  return { min, max }
}

/** Registers one mesh's four attribute buffers and returns its accessor
 *  indices, so the caller only has to wire up meshes/nodes. */
function addMeshBuffers(buffers, accessors, bufferViews, mesh) {
  const posView = buffers.add(mesh.positions)
  const { min, max } = minMax3(mesh.positions)
  const posAccessor = accessors.length
  accessors.push({
    bufferView: bufferViews.push(posView) - 1,
    componentType: 5126,
    count: mesh.vertexCount,
    type: 'VEC3',
    min,
    max,
  })

  const normalAccessor = accessors.length
  accessors.push({
    bufferView: bufferViews.push(buffers.add(mesh.normals)) - 1,
    componentType: 5126,
    count: mesh.vertexCount,
    type: 'VEC3',
  })

  const uvAccessor = accessors.length
  accessors.push({
    bufferView: bufferViews.push(buffers.add(mesh.uvs)) - 1,
    componentType: 5126,
    count: mesh.vertexCount,
    type: 'VEC2',
  })

  const indexAccessor = accessors.length
  accessors.push({
    bufferView: bufferViews.push(buffers.add(mesh.indices)) - 1,
    componentType: 5123,
    count: mesh.indexCount,
    type: 'SCALAR',
  })

  return { posAccessor, normalAccessor, uvAccessor, indexAccessor }
}

function buildGlb(bodyMesh, screenMesh) {
  const buffers = new BufferBuilder()
  const accessors = []
  const bufferViews = []

  const body = addMeshBuffers(buffers, accessors, bufferViews, bodyMesh)
  const screen = addMeshBuffers(buffers, accessors, bufferViews, screenMesh)
  const binary = buffers.build()

  const json = {
    asset: { version: '2.0', generator: 'mockup-studio-make-test-glb' },
    scene: 0,
    scenes: [{ nodes: [0, 1] }],
    nodes: [
      { name: 'Body', mesh: 0 },
      { name: 'Screen', mesh: 1, translation: [0, 0, 0.11] },
    ],
    meshes: [
      {
        name: 'Body',
        primitives: [
          {
            attributes: {
              POSITION: body.posAccessor,
              NORMAL: body.normalAccessor,
              TEXCOORD_0: body.uvAccessor,
            },
            indices: body.indexAccessor,
            material: 0,
          },
        ],
      },
      {
        name: 'Screen',
        primitives: [
          {
            attributes: {
              POSITION: screen.posAccessor,
              NORMAL: screen.normalAccessor,
              TEXCOORD_0: screen.uvAccessor,
            },
            indices: screen.indexAccessor,
            material: 1,
          },
        ],
      },
    ],
    materials: [
      {
        name: 'BodyMaterial',
        pbrMetallicRoughness: {
          baseColorFactor: [0.55, 0.56, 0.6, 1],
          metallicFactor: 0.3,
          roughnessFactor: 0.55,
        },
      },
      {
        name: 'ScreenMaterial',
        pbrMetallicRoughness: {
          baseColorFactor: [0.03, 0.03, 0.03, 1],
          metallicFactor: 0,
          roughnessFactor: 0.3,
        },
      },
    ],
    accessors,
    bufferViews,
    buffers: [{ byteLength: binary.length }],
  }

  return packGlb(json, binary)
}

function packGlb(json, binary) {
  const jsonText = JSON.stringify(json)
  const jsonBuf = padTo4(Buffer.from(jsonText, 'utf8'), 0x20)
  const binBuf = padTo4(binary, 0x00)

  const header = Buffer.alloc(12)
  header.writeUInt32LE(0x46546c67, 0) // magic: "glTF"
  header.writeUInt32LE(2, 4) // version
  const totalLength =
    12 + 8 + jsonBuf.length + 8 + binBuf.length
  header.writeUInt32LE(totalLength, 8)

  const jsonChunkHeader = Buffer.alloc(8)
  jsonChunkHeader.writeUInt32LE(jsonBuf.length, 0)
  jsonChunkHeader.write('JSON', 4, 'ascii')

  const binChunkHeader = Buffer.alloc(8)
  binChunkHeader.writeUInt32LE(binBuf.length, 0)
  binChunkHeader.write('BIN\0', 4, 'ascii')

  return Buffer.concat([header, jsonChunkHeader, jsonBuf, binChunkHeader, binBuf])
}

function padTo4(buf, fill) {
  const pad = (4 - (buf.length % 4)) % 4
  if (!pad) return buf
  return Buffer.concat([buf, Buffer.alloc(pad, fill)])
}

// --- build & write --------------------------------------------------------

const bodyMesh = buildMesh(boxFaces(1.4, 3.0, 0.2))
// A single forward-facing quad standing proud of the body, so it never
// z-fights with it. UVs deliberately span the full 0-1 range, per
// importing-models.md's guidance for a screen mesh.
const screenMesh = buildMesh(boxFaces(1.2, 2.6, 0.001).slice(4, 5))

const glb = buildGlb(bodyMesh, screenMesh)
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, glb)
console.log(`Wrote ${out} (${glb.length} bytes)`)
