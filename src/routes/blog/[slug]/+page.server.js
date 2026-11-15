import { error } from '@sveltejs/kit';
import { index } from '#lib/blog/content.server.js';

// /blog/<name> is either a standalone post or a group page; slugs and group names never collide.
export function entries() {
	return [
		...index.posts.filter((post) => !post.group).map((post) => ({ slug: post.slug })),
		...index.groups.map((group) => ({ slug: group.name }))
	];
}

export function load({ params }) {
	const post = index.posts.find((p) => !p.group && p.slug === params.slug);
	if (post) return { kind: 'post', post, source: post.source };
	const group = index.groups.find((g) => g.name === params.slug);
	if (group) return { kind: 'group', group, source: group.source };
	error(404, 'Not found');
}
