import remarkFootnotes from 'remark-footnotes';
import remarkMath from 'remark-math';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { highlight } from './highlight.js';
import remarkCallouts from './remark-callouts.js';
import remarkImages from './remark-images.js';
import remarkKatex from './remark-katex.js';
import rehypeTables from './rehype-tables.js';
import rehypeToc from './rehype-toc.js';

const textOf = (node) =>
	node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join('');

/** mdsvex options for blog articles. remark-math@3 / remark-footnotes@2 match mdsvex's parser. */
export const mdsvexOptions = {
	extensions: ['.svx'],
	highlight: { highlighter: highlight },
	remarkPlugins: [remarkMath, remarkKatex, remarkFootnotes, remarkCallouts, remarkImages],
	rehypePlugins: [
		rehypeSlug,
		rehypeToc, // before autolinks, so anchor text stays out of the TOC
		[
			rehypeAutolinkHeadings,
			{
				behavior: 'append',
				properties: { className: ['heading-anchor'] },
				content: (heading) => [
					{
						type: 'element',
						tagName: 'span',
						properties: { ariaHidden: 'true' },
						children: [{ type: 'text', value: '#' }]
					},
					{
						type: 'element',
						tagName: 'span',
						properties: { className: ['visually-hidden'] },
						children: [{ type: 'text', value: `Link to section: ${textOf(heading)}` }]
					}
				]
			}
		],
		rehypeTables
	]
};
