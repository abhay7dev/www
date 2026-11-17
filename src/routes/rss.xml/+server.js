import { render } from 'svelte/server';
import FeedRoot from '#lib/components/FeedRoot.svelte';
import { index } from '#lib/blog/content.server.js';
import { plainTitle } from '#lib/blog/format.js';
import { toFeedHtml } from '#lib/feed/html.js';
import { buildRss } from '#lib/feed/xml.js';
import { site } from '#lib/site.js';

const modules = import.meta.glob('/src/content/blog/**/*.svx', { eager: true, import: 'default' });

export function GET() {
	const items = index.posts.map((post) => {
		const url = new URL(post.url, site.origin).href;
		const { body } = render(FeedRoot, {
			props: { content: modules[`/src/content/blog/${post.source}`], url }
		});
		return {
			...post,
			title: plainTitle(post.title),
			html: toFeedHtml(body, { origin: site.origin, url })
		};
	});
	const xml = buildRss(
		{ title: site.name, description: site.description, origin: site.origin, feedPath: '/rss.xml' },
		items
	);
	return new Response(xml, { headers: { 'content-type': 'application/rss+xml' } });
}

export const prerender = true;
