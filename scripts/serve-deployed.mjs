/**
 * Serves `dist/` the way the deployment actually will.
 *
 * `vite preview` sends none of the headers in `vercel.json`, so the strict
 * Content-Security-Policy there is completely untested locally — it either
 * works in production or takes the whole app down, and there is no way to find
 * out from a preview server. A CSP is exactly the kind of config that looks
 * fine and blocks a worker.
 *
 * So this reads `vercel.json` itself rather than restating it: the rewrites,
 * the headers and the output directory all come from the file the platform
 * uses, and a policy tightened there is tested here without anyone remembering
 * to update two places.
 *
 *   node scripts/serve-deployed.mjs &
 *   PORT=4180 node scripts/verify-offline.mjs
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const PORT = Number(process.env.PORT ?? 4180)

const config = JSON.parse(await readFile('vercel.json', 'utf8'))
const ROOT = config.outputDirectory ?? 'dist'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.glb': 'model/gltf-binary',
}

/**
 * Vercel's `source` patterns are path globs, not regexes. Only the two shapes
 * this config actually uses are supported — a literal prefix and a `(.*)`
 * tail — because a general glob engine here would be a second implementation
 * to get wrong.
 */
function matches(source, path) {
  const prefix = source.replace(/\(\.\*\)$/, '')
  return path.startsWith(prefix)
}

function headersFor(path) {
  const headers = {}
  for (const rule of config.headers ?? []) {
    if (!matches(rule.source, path)) continue
    for (const { key, value } of rule.headers) {
      // A `//` comment key is documentation in the JSON, not a header.
      if (key !== undefined) headers[key] = value
    }
  }
  return headers
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`)
  const path = url.pathname

  // Never serve outside the build directory, however creative the request.
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, '')
  let file = join(ROOT, safe)

  let body
  try {
    body = await readFile(file)
  } catch {
    // The SPA rewrite: any path that is not a file is the app's own router's.
    file = join(ROOT, 'index.html')
    try {
      body = await readFile(file)
    } catch {
      response.writeHead(404).end('not found')
      return
    }
  }

  response.writeHead(200, {
    'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
    ...headersFor(path),
  })
  response.end(body)
})

server.listen(PORT, () => {
  console.log(`serving ${ROOT} with vercel.json headers on http://localhost:${PORT}`)
})
