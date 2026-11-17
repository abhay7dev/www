// Runs the background sketch on a canvas: device pixel ratio, resizing, frame pacing, pausing
// (by the user, when the tab is hidden, or when the canvas is offscreen), reduced motion, theme
// changes, and cleanup. Loaded with import() from src/routes/(site)/+layout.svelte, so it never
// ships on /blog. The sketch to replace lives in ./sketch.js.
import { draw, setup } from './sketch.js';

const PAUSED_KEY = 'simulation-paused';

// Phones and low-power devices get a lower resolution and frame rate.
const lowPower = () =>
	matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;

const readPaused = () => {
	try {
		return localStorage.getItem(PAUSED_KEY) === 'true';
	} catch {
		return false;
	}
};
const writePaused = (paused) => {
	try {
		localStorage.setItem(PAUSED_KEY, String(paused));
	} catch {
		// Storage blocked: the choice lasts for this page only.
	}
};

/**
 * Starts the simulation. Returns a controller, or null if the canvas cannot be used (the page
 * then simply shows its plain background).
 * @param {HTMLCanvasElement} canvas
 * @param {{ palette: object, reducedMotion: boolean }} options
 */
export function start(canvas, { palette, reducedMotion }) {
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;

	const slow = lowPower();
	const maxRatio = slow ? 1 : 2;
	const frameInterval = 1000 / (slow ? 30 : 60);

	let width = 0;
	let height = 0;
	let state;
	let paused = readPaused();
	let hidden = document.hidden;
	let offscreen = false;
	let raf = 0;
	let last = 0; // timestamp of the last drawn frame
	let t = 0; // seconds of running time

	const frame = (dt) => draw(ctx, { state, t, dt, width, height, palette });

	function resize() {
		const ratio = Math.min(devicePixelRatio || 1, maxRatio);
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = Math.round(width * ratio);
		canvas.height = Math.round(height * ratio);
		ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
		state = setup({ width, height, palette });
		frame(0); // never leave a resized canvas blank, even while paused
	}

	function tick(now) {
		raf = requestAnimationFrame(tick);
		if (now - last < frameInterval - 1) return;
		const dt = last ? Math.min((now - last) / 1000, 0.1) : 0; // clamp after long stalls
		last = now;
		t += dt;
		frame(dt);
	}

	// Runs only while visible, on screen, unpaused, and motion is allowed.
	function update() {
		const run = !reducedMotion && !paused && !hidden && !offscreen;
		if (run && !raf) {
			last = 0;
			raf = requestAnimationFrame(tick);
		} else if (!run && raf) {
			cancelAnimationFrame(raf);
			raf = 0;
		}
	}

	const onVisibility = () => {
		hidden = document.hidden;
		update();
	};
	const resizer = new ResizeObserver(resize);
	const intersection = new IntersectionObserver(([entry]) => {
		offscreen = !entry.isIntersecting;
		update();
	});
	resizer.observe(canvas);
	intersection.observe(canvas);
	document.addEventListener('visibilitychange', onVisibility);
	resize();
	update();

	return {
		get paused() {
			return paused;
		},
		/** Pauses or resumes, and remembers the choice. */
		setPaused(value) {
			paused = value;
			writePaused(value);
			update();
		},
		/** Switches palettes when the theme changes; redraws if not animating. */
		setPalette(next) {
			palette = next;
			if (!raf) frame(0);
		},
		stop() {
			cancelAnimationFrame(raf);
			raf = 0;
			resizer.disconnect();
			intersection.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
	};
}
