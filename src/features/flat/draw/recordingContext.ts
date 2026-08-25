/**
 * A `CanvasRenderingContext2D` stand-in that records what was asked of it.
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
}

export function recordingContext(): Recording {
  const arcs: ArcCall[] = []
  const texts: TextCall[] = []
  const rects: RectCall[] = []

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

  /** Arcs are only recorded once the path they belong to is painted. */
  let pending: Array<Omit<ArcCall, 'op' | 'color'>> = []
  const flush = (op: 'fill' | 'stroke'): void => {
    const source = op === 'fill' ? ctx.fillStyle : ctx.strokeStyle
    for (const arc of pending) arcs.push({ ...arc, op, color: asColor(source) })
    pending = []
  }

  const ctx = {
    ...state,
    save: () => undefined,
    restore: () => undefined,
    translate: () => undefined,
    scale: () => undefined,
    clip: () => undefined,
    beginPath: () => undefined,
    closePath: () => undefined,
    moveTo: () => undefined,
    lineTo: () => undefined,
    arcTo: () => undefined,
    ellipse: () => undefined,
    rect: () => undefined,
    strokeRect: () => undefined,
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

  return { ctx, arcs, texts, rects }
}

/** Gradients record as an empty string rather than blowing up an assertion. */
const asColor = (value: string | CanvasGradient | CanvasPattern): string =>
  typeof value === 'string' ? value : ''
