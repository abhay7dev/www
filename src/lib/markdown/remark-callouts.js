import { visit } from 'unist-util-visit';
import { CALLOUT_TYPES } from './callout-types.js';

/**
 * GitHub-style `> [!NOTE]` blockquotes become `<aside class="callout callout-note">`, matching the
 * markup of the <Callout> component. mdsvex's remark-parse 8 reads `[!NOTE]` as a shortcut
 * linkReference labelled "!NOTE", so that is the shape matched here.
 */
export default function remarkCallouts() {
	return (tree, file) => {
		visit(tree, 'blockquote', (node) => {
			const para = node.children[0];
			const marker = para?.type === 'paragraph' && para.children[0];
			if (
				marker?.type !== 'linkReference' ||
				marker.referenceType !== 'shortcut' ||
				!marker.label.startsWith('!')
			) {
				return;
			}
			const type = marker.label.slice(1).toLowerCase();
			if (!(type in CALLOUT_TYPES)) file.fail(`Unknown callout type [${marker.label}]`, marker);

			para.children.shift();
			const next = para.children[0];
			if (next?.type === 'text') next.value = next.value.replace(/^[ \t]*\n?/, '');
			if (para.children.every((child) => child.type === 'text' && child.value === '')) {
				node.children.shift();
			}
			node.data = { hName: 'aside', hProperties: { className: ['callout', `callout-${type}`] } };
			node.children.unshift({
				type: 'paragraph',
				data: { hProperties: { className: ['callout-title'] } },
				children: [{ type: 'text', value: CALLOUT_TYPES[type] }]
			});
		});
	};
}
