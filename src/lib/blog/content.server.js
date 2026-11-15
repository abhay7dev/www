// Build-time blog index. Runs only on the server during prerendering.
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { dev } from '$app/env';
import { buildIndex } from './model.js';

const ROOT = 'src/content/blog';
const PREFIX = `/${ROOT}/`;

const modules = import.meta.glob('/src/content/blog/**/*.svx', { eager: true, import: 'metadata' });

function listFiles() {
	return readdirSync(ROOT, { recursive: true, withFileTypes: true })
		.filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
		.map((entry) => path.relative(ROOT, path.join(entry.parentPath, entry.name)))
		.map((file) => file.split(path.sep).join('/'));
}

export const index = buildIndex({
	files: listFiles(),
	metadata: Object.fromEntries(
		Object.entries(modules).map(([key, meta]) => [key.slice(PREFIX.length), meta])
	),
	today: new Date().toISOString().slice(0, 10),
	// INCLUDE_DRAFTS=1 previews drafts in a production build; never set it for deploys.
	includeDrafts: dev || process.env.INCLUDE_DRAFTS === '1'
});

/** Every live page path, for redirect collision checks and the sitemap. */
export function blogPaths() {
	return ['/blog', ...index.posts.map((p) => p.url), ...index.groups.map((g) => g.url)];
}
