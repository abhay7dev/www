import { SKIP, visit } from 'unist-util-visit';

const escape = (text) =>
	text
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/\{/g, '&#123;')
		.replace(/\}/g, '&#125;');

const isRelative = (url) => !/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(url);

/**
 * Markdown images:
 * - every image needs alt text (build error otherwise);
 * - relative raster images become <enhanced:img> (responsive AVIF/WebP + dimensions), linked to
 *   the original file, which is also the zoom target; relative SVGs stay vector <img>;
 * - an image alone in a paragraph becomes a <figure>, with its Markdown title as the caption;
 * - the first image loads eagerly, later ones lazily.
 * Import statements for the original files are passed to the Vite plugin via file.data.imports.
 */
export default function remarkImages() {
	return (tree, file) => {
		const imports = (file.data.imports ??= []);
		let count = 0;

		visit(tree, 'image', (node) => {
			if (!node.alt?.trim()) file.fail(`Image ${node.url} has no alt text`, node);
			if (!isRelative(node.url)) return;

			const id = `__image${count}`;
			const loading = count === 0 ? 'eager' : 'lazy';
			count += 1;
			imports.push(`import ${id} from ${JSON.stringify(`${node.url}?url`)};`);

			const alt = escape(node.alt);
			const img = node.url.endsWith('.svg')
				? `<img src={${id}} alt="${alt}" loading="${loading}" />`
				: `<enhanced:img src="${escape(node.url)}" alt="${alt}" loading="${loading}" data-zoom-src={${id}} />`;
			const caption = node.title ? `<figcaption>${escape(node.title)}</figcaption>` : '';

			node.type = 'html';
			node.value = `<a class="zoomable" href={${id}}>${img}</a>`;
			node.data = { figure: caption };
		});

		// Promote images that stand alone in a paragraph to figures.
		visit(tree, 'paragraph', (node, index, parent) => {
			const [only] = node.children;
			if (node.children.length !== 1 || only.data?.figure === undefined) return;
			parent.children[index] = {
				type: 'html',
				value: `<figure>${only.value}${only.data.figure}</figure>`
			};
			return SKIP;
		});
	};
}
