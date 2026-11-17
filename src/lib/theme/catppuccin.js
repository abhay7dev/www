// Catppuccin Latte (light) and Mocha (dark), from github.com/catppuccin/palette (palette.json).
// app.css repeats these as --ctp-* custom properties; catppuccin.test.js keeps the two in sync.
const hex = {
	latte: {
		rosewater: '#dc8a78',
		flamingo: '#dd7878',
		pink: '#ea76cb',
		mauve: '#8839ef',
		red: '#d20f39',
		maroon: '#e64553',
		peach: '#fe640b',
		yellow: '#df8e1d',
		green: '#40a02b',
		teal: '#179299',
		sky: '#04a5e5',
		sapphire: '#209fb5',
		blue: '#1e66f5',
		lavender: '#7287fd',
		text: '#4c4f69',
		subtext1: '#5c5f77',
		subtext0: '#6c6f85',
		overlay2: '#7c7f93',
		overlay1: '#8c8fa1',
		overlay0: '#9ca0b0',
		surface2: '#acb0be',
		surface1: '#bcc0cc',
		surface0: '#ccd0da',
		base: '#eff1f5',
		mantle: '#e6e9ef',
		crust: '#dce0e8'
	},
	mocha: {
		rosewater: '#f5e0dc',
		flamingo: '#f2cdcd',
		pink: '#f5c2e7',
		mauve: '#cba6f7',
		red: '#f38ba8',
		maroon: '#eba0ac',
		peach: '#fab387',
		yellow: '#f9e2af',
		green: '#a6e3a1',
		teal: '#94e2d5',
		sky: '#89dceb',
		sapphire: '#74c7ec',
		blue: '#89b4fa',
		lavender: '#b4befe',
		text: '#cdd6f4',
		subtext1: '#bac2de',
		subtext0: '#a6adc8',
		overlay2: '#9399b2',
		overlay1: '#7f849c',
		overlay0: '#6c7086',
		surface2: '#585b70',
		surface1: '#45475a',
		surface0: '#313244',
		base: '#1e1e2e',
		mantle: '#181825',
		crust: '#11111b'
	}
};

const toRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

/**
 * Both flavors, every color as `{ hex, rgb }`: hex for CSS/SVG, rgb (0–255) for canvas and WebGL.
 * e.g. `flavors.mocha.lavender.rgb` → `[180, 190, 254]`.
 */
export const flavors = Object.fromEntries(
	Object.entries(hex).map(([flavor, colors]) => [
		flavor,
		Object.fromEntries(Object.entries(colors).map(([name, h]) => [name, { hex: h, rgb: toRgb(h) }]))
	])
);

/** Flavor names by theme: the site's light theme is Latte, dark is Mocha. */
export const themes = { light: 'latte', dark: 'mocha' };
