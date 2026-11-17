// Browser-only theme state. The inline script in app.html applies a stored choice before paint;
// with no stored choice the page follows prefers-color-scheme.
import { flavors, themes } from './catppuccin.js';

const KEY = 'theme';
const dark = () => matchMedia('(prefers-color-scheme: dark)');

/** The theme in effect: 'light' or 'dark'. */
export const currentTheme = () =>
	document.documentElement.dataset.theme ?? (dark().matches ? 'dark' : 'light');

/** The Catppuccin flavor in effect, as `flavors.latte` / `flavors.mocha`. */
export const currentPalette = () => flavors[themes[currentTheme()]];

/** Pins the theme, remembers it, and tells listeners. */
export function setTheme(theme) {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(KEY, theme);
	} catch {
		// Storage blocked: the choice lasts for this page only.
	}
	const color = flavors[themes[theme]].base.hex;
	for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.content = color;
	dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

/** Calls `callback(theme)` when the theme changes, by toggle or by the system. Returns cleanup. */
export function onThemeChange(callback) {
	const fromToggle = (event) => callback(event.detail);
	const fromSystem = () => {
		if (!document.documentElement.dataset.theme) callback(currentTheme());
	};
	const media = dark();
	addEventListener('themechange', fromToggle);
	media.addEventListener('change', fromSystem);
	return () => {
		removeEventListener('themechange', fromToggle);
		media.removeEventListener('change', fromSystem);
	};
}
