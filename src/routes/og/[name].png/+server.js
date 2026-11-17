import { error } from '@sveltejs/kit';
import { index } from '#lib/blog/content.server.js';
import { plainTitle } from '#lib/blog/format.js';
import { renderCard } from '#lib/og.server.js';
import { site } from '#lib/site.js';

// Post slugs are unique across the blog, so /og/<slug>.png needs no group segment.
export function entries() {
	return [{ name: 'site' }, ...index.posts.map((post) => ({ name: post.slug }))];
}

export async function GET({ params }) {
	const post = index.posts.find((p) => p.slug === params.name);
	if (!post && params.name !== 'site') error(404, 'Not found');
	const png = await renderCard(
		post
			? { title: plainTitle(post.title), description: post.description, footer: 'abhay7.dev' }
			: { title: site.name, footer: 'abhay7.dev' }
	);
	return new Response(png, { headers: { 'content-type': 'image/png' } });
}

export const prerender = true;
