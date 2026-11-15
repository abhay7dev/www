// Browser-only article enhancements. Each library is imported on demand, so articles without
// images or diagrams never download it.

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

/** Renders ```mermaid placeholders to SVG; the source stays visible if rendering fails. */
export function enhanceDiagrams(root) {
	const nodes = [...root.querySelectorAll('[data-mermaid]')];
	if (nodes.length === 0) return () => {};

	let cancelled = false;
	import('mermaid').then(async ({ default: mermaid }) => {
		mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
		for (const [i, node] of nodes.entries()) {
			if (cancelled) return;
			try {
				const { svg } = await mermaid.render(`mermaid-${i}`, node.textContent);
				if (!cancelled) node.innerHTML = svg;
			} catch (error) {
				console.error('Mermaid diagram failed to render', error);
			}
		}
	});

	return () => {
		cancelled = true;
	};
}
