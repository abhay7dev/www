import { blogPaths, index } from '#lib/blog/content.server.js';
import { buildRedirects } from '#lib/blog/redirects.js';
import { pages } from '#lib/site.js';
import siteRules from '../../redirects.txt?raw';

export function GET() {
	const body = buildRedirects({
		siteRules,
		posts: index.posts,
		livePaths: [...pages, ...blogPaths()]
	});
	return new Response(body, { headers: { 'content-type': 'text/plain' } });
}

export const prerender = true;
