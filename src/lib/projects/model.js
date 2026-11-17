// Pure projects model: validates project files and frontmatter and sorts them newest first.
// No filesystem or framework access, so it can be unit-tested directly.
import { checkFields, checkSlug, fail, parseDate, requireLine } from '#lib/blog/model.js';

// `toc` is added by the Markdown pipeline, not written by authors.
const FIELDS = new Set([
	'title',
	'description',
	'date',
	'images',
	'stack',
	'links',
	'draft',
	'toc'
]);
const LINKS = new Set(['repo', 'live']);
// Formats enhanced-img can process (SVG screenshots are not supported).
const RASTER = /\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)$/i;

function validateImages(images = [], slug, source, files) {
	if (!Array.isArray(images)) fail(source, '"images" must be a list of { src, alt }');
	return images.map((image) => {
		if (image === null || typeof image !== 'object') fail(source, 'each image needs src and alt');
		const src = requireLine(image.src, source, 'images[].src');
		const alt = requireLine(image.alt, source, 'images[].alt');
		const file = `${slug}/${src}`;
		if (src.includes('/') || !RASTER.test(src)) {
			fail(source, `image "${src}" must be a raster file directly in ${slug}/`);
		}
		if (!files.has(file)) fail(source, `image ${file} does not exist`);
		return { src: file, alt };
	});
}

function validateStack(stack = [], source) {
	if (!Array.isArray(stack)) fail(source, '"stack" must be a list');
	return stack.map((item) => requireLine(item, source, 'stack[]'));
}

function validateLinks(links = {}, source) {
	if (links === null || typeof links !== 'object' || Array.isArray(links)) {
		fail(source, '"links" must be { repo, live }');
	}
	for (const [key, url] of Object.entries(links)) {
		if (!LINKS.has(key)) fail(source, `unknown link "${key}" (use repo or live)`);
		if (typeof url !== 'string' || !URL.canParse(url) || new URL(url).protocol !== 'https:') {
			fail(source, `link "${key}" must be an https URL`);
		}
	}
	return { repo: links.repo ?? null, live: links.live ?? null };
}

/**
 * A project is `<slug>.svx`; a folder named `<slug>` holds its images. Anything else is an error.
 * @param {{ files: string[], metadata: Record<string, object>, today: string, includeDrafts: boolean }} input
 *   `files` and `metadata` keys are paths relative to the projects root, `/`-separated.
 */
export function buildProjects({ files, metadata, today, includeDrafts }) {
	const set = new Set(files);
	for (const file of files) {
		const parts = file.split('/');
		if (parts.length === 1 && file.endsWith('.svx')) continue;
		if (parts.length === 2 && set.has(`${parts[0]}.svx`)) continue;
		fail(file, 'only <slug>.svx files and <slug>/ image folders belong here');
	}

	const projects = files
		.filter((file) => file.endsWith('.svx') && !file.includes('/'))
		.map((source) => {
			const slug = source.slice(0, -4);
			const meta = metadata[source];
			checkFields(meta, FIELDS, source);
			checkSlug(slug, source);
			const draft = meta.draft ?? false;
			if (typeof draft !== 'boolean') fail(source, '"draft" must be true or false');
			const date = parseDate(meta.date, source, 'date');
			if (!draft && date > today) fail(source, `"date" ${date} is in the future`);
			return {
				source,
				slug,
				title: requireLine(meta.title, source, 'title'),
				description: requireLine(meta.description, source, 'description'),
				date,
				draft,
				images: validateImages(meta.images, slug, source, set),
				stack: validateStack(meta.stack, source),
				links: validateLinks(meta.links, source)
			};
		})
		.filter((project) => includeDrafts || !project.draft)
		.sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.slug < b.slug ? -1 : 1));

	// Every project body shares /projects, so heading ids must be unique across projects and must
	// not clash with the ids the page itself uses (layout `main`, and each card and dialog).
	const owners = new Map([['main', 'the page layout']]);
	for (const { slug } of projects) {
		for (const id of [slug, `${slug}-card`, `${slug}-title`]) owners.set(id, `project "${slug}"`);
	}
	for (const { source, slug } of projects) {
		for (const id of headingIds(metadata[source].toc)) {
			if (owners.has(id)) {
				fail(
					source,
					`heading id "#${id}" is already used by ${owners.get(id)}; rename the heading`
				);
			}
			owners.set(id, `a heading in project "${slug}"`);
		}
	}
	return projects;
}

const headingIds = (toc = []) => toc.flatMap((item) => [item.id, ...headingIds(item.children)]);
