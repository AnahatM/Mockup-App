/**
 * A `CanvasRenderingContext2D` stand-in that records what was asked of it.
 *
 * In `lib/` because two features now draw through it — the flat window chrome
 * and the on-screen overlays — and a test double for one of them living inside
 * the other is a cross-feature reach that ESLint is right to refuse. It
 * qualifies as pure: it fabricates a plain object and touches no DOM global it
 * was not handed.
 *
 * The chrome modules are pure drawing code — they take a context and a config
 * and return nothing — so the only way to assert anything about them is to
 * watch what they draw. jsdom's canvas is a stub that throws on `getContext`
 * without the native `canvas` package, and adding a native build dependency to
 * check that a circle landed at x = 20pt would be a poor trade.
 *
 * Only the surface the chrome actually touches is implemented. Anything it
 * starts using will fail loudly as `undefined is not a function` rather than
 * silently recording nothing.
 */

export interface ArcCall {
  x: number
  y: number
  radius: number
  /** Which paint call flushed the path — a disc is filled, its rim stroked. */
  op: 'fill' | 'stroke'
  color: string
}

/**
 * The bounding box of a painted path.
 *
 * Rounded rectangles here are drawn as `moveTo` plus four `arcTo`s rather than
 * with the native `roundRect`, so without this the only trace of a home
 * indicator or a Dock slab is a handful of corner calls that say nothing about
 * the shape they bound. Every coordinate those calls pass — including `arcTo`'s
 * two control points, which are the corners themselves — is exactly the box.
 *
 * Deliberately named for what it is. It is not "the rectangle that was drawn";
 * it is the extent of whatever path was painted, which for these shapes is the
 * same thing and for an arbitrary curve would not be.
 */
export interface PathBoundsCall {
  x: number
  y: number
  width: number
  height: number
  op: 'fill' | 'stroke'
  color: string
}

export interface TextCall {
  text: string
  x: number
  y: number
  align: CanvasTextAlign
  font: string
}

export interface RectCall {
  x: number
  y: number
  width: number
  height: number
  fill: string
}

export interface Recording {
  ctx: CanvasRenderingContext2D
  arcs: ArcCall[]
  texts: TextCall[]
  rects: RectCall[]
  /** Bounding boxes of painted paths, in order. */
  paths: PathBoundsCall[]
}

export function recordingContext(): Recording {
  const arcs: ArcCall[] = []
  const texts: TextCall[] = []
  const rects: RectCall[] = []
  const paths: PathBoundsCall[] = []

  const state = {
    fillStyle: '' as string | CanvasGradient,
    strokeStyle: '' as string | CanvasGradient,
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    globalAlpha: 1,
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetY: 0,
  }

  /** Paths are only recorded once they are painted. */
  let pending: Array<Omit<ArcCall, 'op' | 'color'>> = []
  let points: Array<[number, number]> = []
  const flush = (op: 'fill' | 'stroke'): void => {
    const source = op === 'fill' ? ctx.fillStyle : ctx.strokeStyle
    for (const arc of pending) arcs.push({ ...arc, op, color: asColor(source) })

    const box = bounds(points)
    if (box) paths.push({ ...box, op, color: asColor(source) })

    pending = []
    points = []
  }

  const ctx = {
    ...state,
    save: () => undefined,
    restore: () => undefined,
    translate: () => undefined,
    scale: () => undefined,
    clip: () => undefined,
    beginPath: () => {
      points = []
    },
    closePath: () => undefined,
    moveTo: (x: number, y: number) => {
      points.push([x, y])
    },
    lineTo: (x: number, y: number) => {
      points.push([x, y])
    },
    // Both control points, which for a rounded rectangle are its corners.
    arcTo: (x1: number, y1: number, x2: number, y2: number) => {
      points.push([x1, y1], [x2, y2])
    },
    ellipse: () => undefined,
    rect: () => undefined,
    strokeRect: () => undefined,
    clearRect: () => undefined,
    drawImage: () => undefined,
    arc: (x: number, y: number, radius: number) => {
      pending.push({ x, y, radius })
    },
    fill: () => flush('fill'),
    stroke: () => flush('stroke'),
    fillRect: (x: number, y: number, width: number, height: number) => {
      rects.push({ x, y, width, height, fill: asColor(ctx.fillStyle) })
    },
    fillText: (text: string, x: number, y: number) => {
      texts.push({ text, x, y, align: ctx.textAlign, font: ctx.font })
    },
    measureText: (text: string) => ({ width: text.length * 6 }),
    createLinearGradient: () => ({ addColorStop: () => undefined }),
  } as unknown as CanvasRenderingContext2D

  return { ctx, arcs, texts, rects, paths }
}

/** The extent of a path, or null if too few points to be a shape. */
function bounds(
  points: ReadonlyArray<[number, number]>,
): { x: number; y: number; width: number; height: number } | null {
  if (points.length < 3) return null

  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  const x = Math.min(...xs)
  const y = Math.min(...ys)
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y }
}

/** Gradients record as an empty string rather than blowing up an assertion. */
const asColor = (value: string | CanvasGradient | CanvasPattern): string =>
  typeof value === 'string' ? value : ''
