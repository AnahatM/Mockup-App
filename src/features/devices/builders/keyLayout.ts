/**
 * The shape of a laptop keyboard, in key units.
 *
 * A deck of identical keys in even rows is the tell that a laptop mockup is
 * generated. Nothing else about the render gives it away at a glance, but the
 * eye knows what a keyboard looks like: a wide space bar, a stepped left edge
 * where Tab, Caps and Shift each get longer, a short function row, and an
 * inverted-T of arrows in the bottom right. Getting those four things right is
 * most of the difference, and none of them costs a single triangle — this is
 * all drawn into one texture.
 *
 * Widths are multiples of one standard keycap, so a row's total says how many
 * units wide the whole board is and the drawing code never sees a pixel until
 * it divides by that.
 */

export interface KeyRow {
  /** Row height, as a multiple of a standard key. The function row is short. */
  height: number
  /** Each key's width in units, left to right. */
  keys: readonly number[]
  /**
   * Replaces the last three units with an inverted-T arrow cluster: a
   * full-height left and right, and a half-height up stacked over down.
   */
  arrows?: boolean
}

/**
 * A laptop's US layout, row by row.
 *
 * Every row totals `KEY_UNITS` so the board has straight left and right edges,
 * which is the property that makes the stepped modifier keys read as
 * deliberate rather than as drift. `keyLayout.test.ts` holds each row to it —
 * and earned its place immediately, catching this table at 15 units a row
 * while the constant beside it still said 14.
 */
export const KEY_ROWS: readonly KeyRow[] = [
  // Esc, twelve function keys, Touch ID.
  { height: 0.62, keys: [1.4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6] },
  // Backtick, the digits, hyphen, equals, Delete.
  { height: 1, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2] },
  // Tab, QWERTYUIOP, brackets, backslash.
  { height: 1, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5] },
  // Caps lock, ASDFGHJKL, semicolon, quote, Return.
  { height: 1, keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25] },
  // Shift, ZXCVBNM, comma, period, slash, Shift.
  { height: 1, keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75] },
  // fn, control, option, command, space, command, option, and the arrows.
  {
    height: 1,
    keys: [1, 1, 1.25, 1.25, 5.25, 1.25, 1, 3],
    arrows: true,
  },
]

/** Total width of the board, in key units. Every row must match it. */
export const KEY_UNITS = 15
