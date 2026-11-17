// Build-time projects index. Runs only on the server during prerendering.
import { dev } from '$app/env';
import { listFiles } from '#lib/blog/content.server.js';
import { buildProjects } from './model.js';

const ROOT = 'src/content/projects';
const PREFIX = `/${ROOT}/`;

const modules = import.meta.glob('/src/content/projects/*.svx', {
	eager: true,
	import: 'metadata'
});

export const projects = buildProjects({
	files: listFiles(ROOT),
	metadata: Object.fromEntries(
		Object.entries(modules).map(([key, meta]) => [key.slice(PREFIX.length), meta])
	),
	today: new Date().toISOString().slice(0, 10),
	includeDrafts: dev || process.env.INCLUDE_DRAFTS === '1'
});
