import { visit } from 'unist-util-visit';

const textOf = (node) =>
	node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join('');

// The TOC is already ordered and nested, so authored numbering ("1.", "2 -"), list markers ("- ",
// "* "), and a trailing colon are noise there. The heading itself keeps its text.
export const tocText = (text) =>
	text
		.trim()
		.replace(/^(?:\d+(?:\.\d+)*(?:[.):]|\s+[-–—])|[-*•])\s+/, '')
		.replace(/\s*:$/, '');

/**
 * Collects headings (after rehype-slug assigns ids) into a nested table of contents stored in
 * the frontmatter as `toc`, which mdsvex exports with `metadata`.
 */
export default function rehypeToc() {
	return (tree, file) => {
		const root = { depth: 0, children: [] };
		const stack = [root];
		visit(tree, 'element', (node) => {
			const level = /^h([1-6])$/.exec(node.tagName)?.[1];
			const id = node.properties?.id;
			if (!level || !id) return;
			const item = { id, text: tocText(textOf(node)), depth: Number(level), children: [] };
			while (stack.at(-1).depth >= item.depth) stack.pop();
			stack.at(-1).children.push(item);
			stack.push(item);
		});
		file.data.fm = { ...file.data.fm, toc: root.children };
	};
}
