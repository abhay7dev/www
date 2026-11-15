// Pure blog model: classifies content files, validates frontmatter, and builds the listing.
// No filesystem or framework access, so it can be unit-tested directly.

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = new Set(['index', '404']);
// `toc` is added by the Markdown pipeline, not written by authors.
const POST_FIELDS = new Set([
	'title',
	'date',
	'updated',
	'description',
	'draft',
	'redirect_from',
	'toc'
]);
const GROUP_FIELDS = new Set(['title', 'description', 'toc']);

export class ContentError extends Error {
	name = 'ContentError';
}

function fail(file, message) {
	throw new ContentError(`${file}: ${message}`);
}

function checkFields(meta, allowed, file) {
	if (meta === null || typeof meta !== 'object') fail(file, 'missing frontmatter');
	for (const key of Object.keys(meta)) {
		if (!allowed.has(key)) fail(file, `unknown frontmatter field "${key}"`);
	}
}

function requireLine(value, file, field) {
	if (typeof value !== 'string' || value.trim() === '') fail(file, `"${field}" is required`);
	if (/[\r\n]/.test(value)) fail(file, `"${field}" must be a single line`);
	return value.trim();
}

/** Accepts `YYYY-MM-DD`, or the midnight-UTC ISO string mdsvex produces for unquoted YAML dates. */
export function parseDate(value, file, field) {
	const text =
		typeof value === 'string' && value.endsWith('T00:00:00.000Z') ? value.slice(0, 10) : value;
	if (typeof text !== 'string' || !DATE.test(text)) {
		fail(file, `"${field}" must be a YYYY-MM-DD date, got ${JSON.stringify(value)}`);
	}
	if (new Date(`${text}T00:00:00Z`).toISOString().slice(0, 10) !== text) {
		fail(file, `"${field}" is not a real calendar date: ${text}`);
	}
	return text;
}

function checkSlug(slug, file) {
	if (!SLUG.test(slug)) fail(file, `"${slug}" must be lowercase letters, digits, and hyphens`);
	if (RESERVED_SLUGS.has(slug)) fail(file, `"${slug}" is a reserved name`);
}

/**
 * Sorts every content file into standalone posts, groups, grouped posts, and asset files.
 * A folder is a group if it holds `index.svx`; a folder named like a sibling `.svx` holds that
 * post's assets; anything else is an error.
 * @param {string[]} files paths relative to the blog content root, `/`-separated
 */
export function classify(files) {
	const set = new Set(files);
	const posts = [];
	const groups = [];

	for (const file of files) {
		const parts = file.split('/');
		const [top] = parts;

		if (parts.length === 1) {
			if (!file.endsWith('.svx')) fail(file, 'only .svx files and folders belong here');
			if (file === 'index.svx') fail(file, 'the blog root cannot have an index.svx');
			posts.push({ source: file, slug: file.slice(0, -4), group: null });
			continue;
		}

		if (set.has(`${top}.svx`)) {
			if (set.has(`${top}/index.svx`)) fail(file, `"${top}" is both a post and a group`);
			continue; // asset folder of a standalone post
		}
		if (!set.has(`${top}/index.svx`)) {
			fail(file, `folder "${top}" is neither a group (no index.svx) nor a post's asset folder`);
		}

		if (parts.length === 2) {
			const name = parts[1];
			if (!name.endsWith('.svx')) fail(file, 'only .svx files and asset folders belong in a group');
			if (name === 'index.svx') groups.push({ source: file, name: top });
			else posts.push({ source: file, slug: name.slice(0, -4), group: top });
			continue;
		}

		const sub = parts[1];
		if (set.has(`${top}/${sub}.svx`)) continue; // asset folder of a grouped post
		if (set.has(`${top}/${sub}/index.svx`)) fail(file, 'groups cannot be nested');
		fail(file, `folder "${top}/${sub}" is not an asset folder of a post in this group`);
	}

	return { posts, groups };
}

function newestFirst(a, b) {
	if (a.date !== b.date) return a.date < b.date ? 1 : -1;
	return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}

function validatePost({ source, slug, group }, meta, today) {
	checkFields(meta, POST_FIELDS, source);
	checkSlug(slug, source);
	const draft = meta.draft ?? false;
	if (typeof draft !== 'boolean') fail(source, '"draft" must be true or false');
	const date = parseDate(meta.date, source, 'date');
	const updated = meta.updated === undefined ? null : parseDate(meta.updated, source, 'updated');
	if (updated && updated < date) fail(source, '"updated" is earlier than "date"');
	if (!draft && date > today) fail(source, `"date" ${date} is in the future`);
	if (!draft && updated && updated > today) fail(source, `"updated" ${updated} is in the future`);

	const redirectFrom = meta.redirect_from ?? [];
	if (!Array.isArray(redirectFrom)) fail(source, '"redirect_from" must be a list of paths');
	for (const path of redirectFrom) {
		if (typeof path !== 'string' || !path.startsWith('/') || /\s/.test(path)) {
			fail(source, `invalid redirect_from path ${JSON.stringify(path)}`);
		}
	}

	return {
		source,
		slug,
		group,
		url: group ? `/blog/${group}/${slug}` : `/blog/${slug}`,
		title: requireLine(meta.title, source, 'title'),
		description: requireLine(meta.description, source, 'description'),
		date,
		updated,
		draft,
		redirectFrom,
		toc: meta.toc ?? []
	};
}

/**
 * @param {{ files: string[], metadata: Record<string, object>, today: string, includeDrafts: boolean }} input
 *   `metadata` is keyed by the same relative paths as `files`; `today` is `YYYY-MM-DD` (UTC).
 */
export function buildIndex({ files, metadata, today, includeDrafts }) {
	const classified = classify([...files].sort());

	const names = new Map();
	const claim = (name, source) => {
		if (names.has(name)) fail(source, `"${name}" is already used by ${names.get(name)}`);
		names.set(name, source);
	};

	const allPosts = classified.posts.map((entry) => {
		claim(entry.slug, entry.source);
		return validatePost(entry, metadata[entry.source], today);
	});
	const posts = allPosts.filter((post) => includeDrafts || !post.draft).sort(newestFirst);

	const groups = [];
	for (const { source, name } of classified.groups) {
		const meta = metadata[source];
		checkFields(meta, GROUP_FIELDS, source);
		checkSlug(name, source);
		claim(name, source);
		const members = posts.filter((post) => post.group === name);
		// A group with no visible posts (e.g. only drafts) is not published.
		if (members.length === 0) continue;
		groups.push({
			source,
			name,
			slug: name,
			url: `/blog/${name}`,
			title: requireLine(meta.title, source, 'title'),
			description: requireLine(meta.description, source, 'description'),
			date: members[0].date,
			posts: members
		});
	}

	const listing = [
		...posts.filter((post) => !post.group).map((post) => ({ kind: 'post', ...post })),
		...groups.map((group) => ({ kind: 'group', ...group }))
	].sort(newestFirst);

	return { posts, groups, listing };
}
