import { visit } from 'unist-util-visit';

/**
 * Shifts Markdown headings down one level (`#` → h2 … `#####` → h6; h6 stays) so the article
 * title is the page's only h1 and always outranks the body's headings.
 */
export default function rehypeDemoteHeadings() {
	return (tree) => {
		visit(tree, 'element', (node) => {
			const level = /^h([1-5])$/.exec(node.tagName)?.[1];
			if (level) node.tagName = `h${Number(level) + 1}`;
		});
	};
}
