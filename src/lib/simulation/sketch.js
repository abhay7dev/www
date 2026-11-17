// The background simulation itself. Not chosen yet: this is the stub to replace.
// simulation.js owns the canvas, timing, sizing, pausing, and theme; this file only draws.
//
// `palette` is the current Catppuccin flavor (Latte in light mode, Mocha in dark), with every
// color as `{ hex, rgb }`, e.g. `palette.lavender.hex` → '#b4befe' or `palette.base.rgb` →
// [30, 30, 46]. It changes when the theme does; read it on every frame rather than caching it.
// The full palettes are also importable: `import { flavors } from '#lib/theme/catppuccin.js'`.

/**
 * Called once when the canvas starts, and again after every resize. Return any state the
 * simulation needs; it is passed back to `draw`.
 * @param {{ width: number, height: number, palette: object }} env CSS pixels
 */
export function setup({ width, height }) {
	return { width, height };
}

/**
 * Draws one frame. The context is already scaled for the device pixel ratio, so draw in CSS
 * pixels. With reduced motion, this is called once with t = 0 to draw a still frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ state: object, t: number, dt: number, width: number, height: number, palette: object }} frame
 *   t: seconds since start (excluding paused time); dt: seconds since the previous frame
 */
export function draw(ctx, { width, height }) {
	ctx.clearRect(0, 0, width, height);
}
