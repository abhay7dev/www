import { index } from '#lib/blog/content.server.js';
import { buildSitemap } from '#lib/feed/xml.js';
import { pages, site } from '#lib/site.js';

export function GET() {
	const xml = buildSitemap(site.origin, [
		...pages.map((path) => ({ path })),
		...index.groups.map((group) => ({ path: group.url, lastmod: group.date })),
		...index.posts.map((post) => ({ path: post.url, lastmod: post.updated ?? post.date }))
	]);
	return new Response(xml, { headers: { 'content-type': 'application/xml' } });
}

export const prerender = true;
