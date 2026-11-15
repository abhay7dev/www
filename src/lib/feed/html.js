// Turns server-rendered article HTML into feed-safe HTML: text content with absolute URLs.
// Operates only on markup this site generates (Svelte SSR, KaTeX, our Mermaid wrapper).

/** Removes KaTeX's visual HTML layer, leaving the MathML that feed readers can display. */
export function keepMathml(html) {
	const open = '<span class="katex-html" aria-hidden="true">';
	let out = '';
	let rest = html;
	for (let start = rest.indexOf(open); start !== -1; start = rest.indexOf(open)) {
		out += rest.slice(0, start);
		// KaTeX output only nests <span>, so balancing spans finds the end of this layer.
		const tags = /<span\b|<\/span>/g;
		tags.lastIndex = start;
		let depth = 0;
		let end = -1;
		for (let match; (match = tags.exec(rest));) {
			depth += match[0] === '</span>' ? -1 : 1;
			if (depth === 0) {
				end = tags.lastIndex;
				break;
			}
		}
		if (end === -1) throw new Error('unbalanced KaTeX markup');
		rest = rest.slice(end);
	}
	return out + rest;
}

/** Makes root-relative `src`, `href`, and `srcset` URLs absolute. */
export function absolutize(html, origin) {
	return html
		.replace(/\b(src|href)="\/(?!\/)/g, `$1="${origin}/`)
		.replace(
			/\bsrcset="([^"]*)"/g,
			(_, value) => `srcset="${value.replace(/(^|,\s*)\/(?!\/)/g, `$1${origin}/`)}"`
		);
}

/**
 * @param {string} html output of svelte/server `render`
 * @param {{ origin: string, url: string }} options `url` is the article's absolute URL
 */
export function toFeedHtml(html, { origin, url }) {
	const link = `<p><a href="${url}">View this diagram on abhay7.dev</a></p>`;
	const cleaned = html
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<div class="mermaid" data-mermaid="">[\s\S]*?<\/div>/g, link);
	return absolutize(keepMathml(cleaned), origin).trim();
}
