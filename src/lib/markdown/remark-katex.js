import katex from 'katex';
import { visit } from 'unist-util-visit';

/**
 * Renders remark-math nodes with KaTeX at build time, emitted as `{@html "…"}` so Svelte never
 * parses the braces inside KaTeX's TeX annotations (rehype-katex output breaks compilation).
 */
export default function remarkKatex() {
	return (tree, file) => {
		visit(tree, ['math', 'inlineMath'], (node) => {
			let html;
			try {
				html = katex.renderToString(node.value, {
					displayMode: node.type === 'math',
					throwOnError: true
				});
			} catch (error) {
				file.fail(`KaTeX: ${error.message}`, node);
			}
			node.type = 'html';
			node.value = `{@html ${JSON.stringify(html)}}`;
			delete node.data;
		});
	};
}
