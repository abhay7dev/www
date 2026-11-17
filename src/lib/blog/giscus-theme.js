// The giscus theme, passed to giscus as a data: URL, so dev and production behave the same
// (a localhost theme URL is blocked inside the giscus.app iframe; a hosted file needs CORS).
// It is the official Catppuccin theme with this site's accents, borders, and loading logo.
import favicon from '../../../static/favicon.svg?raw';
import { flavors, themes } from '#lib/theme/catppuccin.js';

// The logo is inlined (no request from inside the iframe). Placeholder: follows the favicon.
// shortcut: inlining a ~3 KB SVG makes giscus's iframe URL ~7.4 KB; if the real logo is much
// larger, host it and reference its public https URL instead.
const svg = favicon
	.replace(/<\?xml[^>]*>|<!DOCTYPE[^>]*>/g, '')
	.replace(/\s+/g, ' ')
	.trim();
const LOGO = `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** @param {'light' | 'dark'} theme */
export function giscusTheme(theme) {
	const flavor = themes[theme];
	const c = Object.fromEntries(Object.entries(flavors[flavor]).map(([k, v]) => [k, v.hex]));
	// Latte Lavender fails as text (2.81:1), so in light mode text-like accents use Text.
	const strong = theme === 'dark' ? c.lavender : c.text;
	const css = `@import url('https://giscus.app/themes/catppuccin_${flavor}.css');
main {
	--color-accent-fg: ${strong};
	--color-accent-emphasis: ${c.lavender};
	--color-accent-muted: ${c.lavender}66;
	--color-accent-subtle: ${c.lavender}26;
	--color-attention-muted: ${c.lavender};
	--color-attention-subtle: ${c.lavender}26;
	--color-btn-outline-text: ${strong};
	--color-btn-bg: ${c.mantle};
	--color-btn-border: ${c.surface0};
	--color-btn-hover-bg: ${c.surface0};
	--color-btn-hover-border: ${c.surface1};
	--color-btn-primary-bg: ${strong};
	--color-btn-primary-text: ${c.base};
	--color-btn-primary-hover-bg: ${strong};
	--color-btn-primary-hover-border: transparent;
	--color-btn-primary-selected-bg: ${strong};
	--color-btn-primary-disabled-bg: ${strong}66;
	--color-btn-primary-disabled-text: ${c.base};
	--color-border-default: ${c.surface0};
	--color-border-muted: ${c.surface0};
	--color-canvas-subtle: ${c.mantle};
	--color-segmented-control-button-selected-border: ${c.surface1};
}
main .gsc-loading-image {
	background-image: url("${LOGO}");
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center;
	animation: logo-pulse 1.2s ease-in-out infinite;
}
@keyframes logo-pulse {
	50% { opacity: 0.4; transform: scale(0.85); }
}
@media (prefers-reduced-motion: reduce) {
	main .gsc-loading-image { animation: none; }
}`;
	const minified = css.replace(/\s*\n\s*/g, '').replace(/:\s+/g, ':');
	return `data:text/css,${encodeURIComponent(minified)}`;
}
