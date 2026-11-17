import remarkFootnotes from 'remark-footnotes';
import remarkMath from 'remark-math';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import { highlight } from './highlight.js';
import remarkCallouts from './remark-callouts.js';
import remarkImages from './remark-images.js';
import remarkKatex from './remark-katex.js';
import rehypeDemoteHeadings from './rehype-demote-headings.js';
import rehypeTables from './rehype-tables.js';
import rehypeToc from './rehype-toc.js';

/** mdsvex options for blog articles. remark-math@3 / remark-footnotes@2 match mdsvex's parser. */
export const mdsvexOptions = {
	extensions: ['.svx'],
	highlight: { highlighter: highlight },
	remarkPlugins: [remarkMath, remarkKatex, remarkFootnotes, remarkCallouts, remarkImages],
	rehypePlugins: [
		rehypeDemoteHeadings,
		rehypeSlug,
		rehypeToc, // before autolinks, so the TOC holds plain heading text
		// The heading text itself is the permalink (no visible marker).
		[rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['heading-link'] } }],
		rehypeTables
	]
};
