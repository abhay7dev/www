import { compile } from 'mdsvex';

/**
 * Compiles `.svx` with mdsvex as the first Vite transform, instead of as a Svelte preprocessor,
 * so `@sveltejs/enhanced-img` (a `pre` transform) sees Svelte markup rather than Markdown.
 * Remark/rehype plugins may push import statements to `file.data.imports`; they are injected
 * into the component's module script.
 */
export function mdsvexFirst(options) {
	return {
		name: 'mdsvex-first',
		enforce: 'pre',
		transform: {
			order: 'pre',
			filter: { id: /\.svx$/ },
			async handler(source, id) {
				const out = await compile(source, { ...options, filename: id });
				// mdsvex still emits the Svelte 4 module-script syntax, which Svelte 5 warns about.
				const code = out.code.replace('<script context="module">', '<script module>');
				// mdsvex produces no source map; an empty mapping says so explicitly.
				return { code: injectImports(code, out.data?.imports ?? []), map: { mappings: '' } };
			}
		}
	};
}

export function injectImports(code, imports) {
	if (imports.length === 0) return code;
	const lines = imports.join('\n');
	const moduleScript = /<script\b[^>]*\b(?:context="module"|module)\b[^>]*>/.exec(code);
	if (moduleScript) {
		const at = moduleScript.index + moduleScript[0].length;
		return `${code.slice(0, at)}\n${lines}${code.slice(at)}`;
	}
	return `<script module>\n${lines}\n</script>\n${code}`;
}
