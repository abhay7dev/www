import { error } from '@sveltejs/kit';
import { renderCard } from '#lib/og.server.js';
import { projects } from '#lib/projects/content.server.js';

// Default 16:9 thumbnail for projects without images.
const withoutImages = () => projects.filter((project) => project.images.length === 0);

export function entries() {
	return withoutImages().map(({ slug }) => ({ slug }));
}

export async function GET({ params }) {
	const project = withoutImages().find((p) => p.slug === params.slug);
	if (!project) error(404, 'Not found');
	const png = await renderCard({
		title: project.title,
		footer: project.stack.join('  ') || 'abhay7.dev',
		height: 675
	});
	return new Response(png, { headers: { 'content-type': 'image/png' } });
}

export const prerender = true;
