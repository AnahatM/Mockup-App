/**
 * Which modules load before any lazy boundary, and whether any of them pull 3D.
 *
 * The browser probe (verify-bundle.mjs) says *that* a route downloads the 3D
 * engine; this says *why*, by walking static imports from the entry and
 * stopping at every dynamic `import()` — which is exactly where a lazy route
 * begins. Anything reachable here is in the eager graph, so it ships to every
 * page including the landing page and the documentation.
 *
 * The property being defended (ADR 0006): a visitor reading the documentation,
 * or using the 2D window tool, should not download three.js.
 */
import { readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, resolve, join, relative } from 'node:path'

const ENTRY = 'src/main.tsx'
const THREE = /from\s+['"](three|@react-three\/[a-z-]+|postprocessing)['"]/

/**
 * Static imports only — a dynamic `import()` is a chunk boundary, not an edge.
 *
 * The clause is matched with `[^;'"]*`, which crosses newlines on purpose: a
 * multi-line `import {\n  Foo,\n} from 'three'` is by far the common shape in
 * this codebase, and a pattern that stopped at the first newline silently
 * walked a fraction of the graph and reported it as clean.
 */
const STATIC_IMPORT = /(?:^|\n)\s*(?:import|export)\b[^;'"]*from\s*['"]([^'"]+)['"]/g

const slash = (value) => value.split('\\').join('/')

function resolveSpecifier(spec, fromFile) {
  if (spec.endsWith('.css')) return null

  let base
  if (spec.startsWith('@/')) base = join('src', spec.slice(2))
  else if (spec.startsWith('.')) base = relative(process.cwd(), resolve(dirname(fromFile), spec))
  else return null // node_modules — not our source graph

  const rel = slash(base)
  for (const candidate of [rel, `${rel}.ts`, `${rel}.tsx`, `${rel}/index.ts`, `${rel}/index.tsx`]) {
    if (!existsSync(candidate)) continue
    if (!statSync(candidate).isFile()) continue
    if (/\.tsx?$/.test(candidate)) return candidate
  }
  return null
}

const seen = new Set()
const offenders = []

function walk(file, trail) {
  if (seen.has(file)) return
  seen.add(file)

  const source = readFileSync(file, 'utf8')
  if (THREE.test(source)) offenders.push({ file, via: [...trail.slice(-3), file] })

  for (const match of source.matchAll(STATIC_IMPORT)) {
    const target = resolveSpecifier(match[1], file)
    if (target) walk(target, [...trail, file])
  }
}

walk(ENTRY, [])

console.log(
  JSON.stringify(
    {
      eagerModules: seen.size,
      pulls3D: offenders.length > 0,
      offenders,
    },
    null,
    2,
  ),
)
