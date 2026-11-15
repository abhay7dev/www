import { error } from '@sveltejs/kit';
import { index } from '#lib/blog/content.server.js';

export function entries() {
	return index.posts
		.filter((post) => post.group)
		.map((post) => ({ group: post.group, slug: post.slug }));
}

export function load({ params }) {
	const post = index.posts.find((p) => p.group === params.group && p.slug === params.slug);
	if (!post) error(404, 'Not found');
	return { kind: 'post', post, source: post.source };
}
