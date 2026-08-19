import type { BackdropConfig } from '../schema'

/**
 * Paints the backdrop onto a 2D canvas, which is then used as the scene
 * background. Pure drawing logic, kept separate from any React or three.js so it
 * can be reasoned about (and drawn into an export canvas) on its own.
 *
 * `cyclorama` and `grid` paint only their base colour here — their character
 * comes from real geometry that catches light and shadow.
 */
export function paintBackdrop(
  ctx: CanvasRenderingContext2D,
  size: number,
  config: BackdropConfig,
): void {
  ctx.clearRect(0, 0, size, size)

  switch (config.mode) {
    case 'transparent':
      return
    case 'gradient':
      paintGradient(ctx, size, config)
      return
    case 'glow':
      paintGlow(ctx, size, config)
      return
    case 'solid':
    case 'cyclorama':
    case 'grid':
      ctx.fillStyle = config.color
      ctx.fillRect(0, 0, size, size)
  }
}

function paintGradient(
  ctx: CanvasRenderingContext2D,
  size: number,
  config: BackdropConfig,
): void {
  // Project the angle onto the canvas so 0rad is bottom-to-top.
  const half = size / 2
  const dx = Math.sin(config.angle) * half
  const dy = Math.cos(config.angle) * half
  const gradient = ctx.createLinearGradient(half - dx, half + dy, half + dx, half - dy)
  gradient.addColorStop(0, config.color)
  gradient.addColorStop(1, config.accent)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
}

function paintGlow(
  ctx: CanvasRenderingContext2D,
  size: number,
  config: BackdropConfig,
): void {
  ctx.fillStyle = config.color
  ctx.fillRect(0, 0, size, size)

  // Centred slightly above the middle so the product sits in the bright part
  // rather than on top of it.
  const cx = size / 2
  const cy = size * 0.44
  const radius = Math.max(size * config.glowRadius, 1)
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  glow.addColorStop(0, config.accent)
  glow.addColorStop(1, 'transparent')

  ctx.globalAlpha = config.glowStrength
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)
  ctx.globalAlpha = 1
}
