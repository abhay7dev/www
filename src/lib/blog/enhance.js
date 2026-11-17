// Browser-only article enhancements. Each library is imported on demand, so articles without
// images or diagrams never download it.
import { mount, unmount } from 'svelte';
import CopyButton from '#lib/components/blog/CopyButton.svelte';
import { currentPalette, currentTheme, onThemeChange } from '#lib/theme/theme.js';

/** Zooms linked article images with medium-zoom; returns a cleanup function. */
export function enhanceImages(root) {
	const links = root.querySelectorAll('a.zoomable');
	if (links.length === 0) return () => {};

	let zoom;
	let cancelled = false;
	import('medium-zoom').then(({ default: mediumZoom }) => {
		if (!cancelled) zoom = mediumZoom(root.querySelectorAll('a.zoomable img'));
	});
	// Until zoom is ready the link opens the full-size image, which is also the no-JS behavior.
	const onclick = (event) => {
		if (zoom && event.target.closest('a.zoomable')) event.preventDefault();
	};
	root.addEventListener('click', onclick);

	return () => {
		cancelled = true;
		root.removeEventListener('click', onclick);
		zoom?.detach();
	};
}

/** Adds a copy button to every highlighted code block; returns a cleanup function. */
export function enhanceCode(root) {
	const blocks = [...root.querySelectorAll('.code-block')];
	if (blocks.length === 0) return () => {};
	const mounted = blocks.map((block) =>
		mount(CopyButton, {
			target: block.querySelector('.code-head'),
			props: { code: block.querySelector('code') }
		})
	);
	return () => mounted.forEach((component) => unmount(component));
}

// Mermaid colors from the current Catppuccin flavor.
const mermaidConfig = (theme) => {
	const p = currentPalette();
	return {
		startOnLoad: false,
		securityLevel: 'strict',
		theme: 'base',
		themeVariables: {
			darkMode: theme === 'dark',
			fontFamily: 'Fira Sans, sans-serif',
			background: p.base.hex,
			primaryColor: p.surface0.hex,
			primaryTextColor: p.text.hex,
			primaryBorderColor: p.overlay0.hex,
			secondaryColor: p.mantle.hex,
			tertiaryColor: p.crust.hex,
			lineColor: p.overlay1.hex,
			textColor: p.text.hex,
			noteBkgColor: p.surface1.hex,
			noteTextColor: p.text.hex
		}
	};
};

/**
 * Renders ```mermaid placeholders to SVG, and again in the new colors when the theme changes.
 * The source stays visible if rendering fails.
 */
export function enhanceDiagrams(root) {
	const nodes = [...root.querySelectorAll('[data-mermaid]')];
	if (nodes.length === 0) return () => {};
	const sources = nodes.map((node) => node.textContent);

	let cancelled = false;
	let renders = 0; // Mermaid needs a fresh element id per render
	let stopTheme = () => {};
	import('mermaid').then(({ default: mermaid }) => {
		const render = async (theme) => {
			mermaid.initialize(mermaidConfig(theme));
			for (const [i, node] of nodes.entries()) {
				if (cancelled) return;
				try {
					const { svg } = await mermaid.render(`mermaid-${renders++}`, sources[i]);
					if (!cancelled) node.innerHTML = svg;
				} catch (error) {
					console.error('Mermaid diagram failed to render', error);
				}
			}
		};
		if (cancelled) return;
		render(currentTheme());
		stopTheme = onThemeChange(render);
	});

	return () => {
		cancelled = true;
		stopTheme();
	};
}
