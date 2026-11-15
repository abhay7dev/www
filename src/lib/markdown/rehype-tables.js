import { SKIP, visit } from 'unist-util-visit';

/** Wraps tables in a horizontal scroll container for narrow screens. */
export default function rehypeTables() {
	return (tree) => {
		visit(tree, 'element', (node, index, parent) => {
			if (node.tagName !== 'table' || !parent) return;
			parent.children[index] = {
				type: 'element',
				tagName: 'div',
				// Browsers make overflowing scroll containers keyboard-focusable themselves.
				properties: { className: ['table-scroll'] },
				children: [node]
			};
			return [SKIP, index + 1];
		});
	};
}
