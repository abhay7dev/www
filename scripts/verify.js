// Checks the built site in build/. Run after `bun run build`.
// Reports initial JavaScript per page (modulepreloads + entry imports + their static imports);
// chunks loaded later on demand are summarized separately.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'bun';

const BUILD = 'build';
const ORIGIN = 'https://abhay7.dev';
const errors = [];
const check = (ok, message) => ok || errors.push(message);

if (!existsSync(BUILD)) {
	console.error('build/ not found; run `bun run build` first');
	process.exit(1);
}

const read = (file) => readFileSync(path.join(BUILD, file), 'utf8');
const walk = (dir) =>
	readdirSync(path.join(BUILD, dir), { withFileTypes: true }).flatMap((entry) => {
		const rel = path.posix.join(dir, entry.name);
		return entry.isDirectory() ? walk(rel) : [rel];
	});
const files = walk('');

/** Maps a site path to the built file Cloudflare Pages would serve. */
function fileFor(urlPath) {
	const clean = decodeURI(urlPath.split(/[?#]/)[0]).replace(/^\//, '');
	const candidates =
		clean === '' ? ['index.html'] : [clean, `${clean}.html`, `${clean}/index.html`];
	return candidates.find((c) => files.includes(c));
}

/** Adds every chunk reachable through static `import … from "…"` statements (not `import()`). */
function withStaticImports(urls) {
	const seen = new Set();
	const queue = [...urls];
	while (queue.length) {
		const url = queue.pop();
		if (seen.has(url)) continue;
		seen.add(url);
		const code = readFileSync(path.join(BUILD, url), 'utf8');
		for (const [, spec] of code.matchAll(/(?:\bfrom|\bimport)\s*["']([^"']+\.js)["']/g)) {
			queue.push(path.posix.join(path.posix.dirname(url), spec));
		}
	}
	return seen;
}

const required = [
	'index.html',
	'about.html',
	'projects.html',
	'experience.html',
	'contact.html',
	'licenses.html',
	'blog.html',
	'404.html',
	'blog/404.html',
	'rss.xml',
	'sitemap.xml',
	'_redirects',
	'_headers',
	'robots.txt',
	'manifest.webmanifest',
	'favicon.svg',
	'og/site.png'
];
for (const file of required) check(files.includes(file), `missing ${file}`);

// 404 pages must work without JavaScript and point to the right place.
for (const [file, home] of [
	['404.html', '/'],
	['blog/404.html', '/blog']
]) {
	const html = read(file);
	check(!html.includes('<script'), `${file} contains a <script>`);
	check(html.includes(`href="${home}"`), `${file} does not link to ${home}`);
}

const htmlFiles = files.filter((f) => f.endsWith('.html'));
const jsRows = [];
for (const file of htmlFiles) {
	const html = read(file);
	check(/<meta http-equiv="content-security-policy"/.test(html), `${file}: no CSP meta tag`);
	check(/<title>[^<]+<\/title>/.test(html), `${file}: no <title>`);
	if (!html.includes('name="robots" content="noindex"')) {
		check(html.includes('rel="canonical"'), `${file}: no canonical link`);
		const image = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
		check(image, `${file}: no og:image`);
		if (image?.startsWith(ORIGIN)) {
			check(fileFor(image.slice(ORIGIN.length)), `${file}: og:image ${image} not built`);
		}
	}

	// Internal links and assets must resolve to built files.
	for (const [, url] of html.matchAll(/(?:href|src)="(\/[^"/][^"]*|\/)"/g)) {
		check(fileFor(url), `${file}: broken internal URL ${url}`);
	}

	const js = withStaticImports([
		...[...html.matchAll(/<link\b[^>]*>/g)]
			.filter(([tag]) => tag.includes('rel="modulepreload"'))
			.map(([tag]) => /href="([^"]+)"/.exec(tag)[1]),
		...[...html.matchAll(/import\("([^"]+\.js)"\)/g)].map((m) => m[1])
	]);
	let raw = 0;
	let gz = 0;
	for (const url of js) {
		const data = readFileSync(path.join(BUILD, url));
		raw += data.length;
		gz += gzipSync(data).length;
	}
	jsRows.push({
		page: file,
		files: js.size,
		kB: +(raw / 1024).toFixed(1),
		gzip_kB: +(gz / 1024).toFixed(1),
		chunks: [...js]
	});

	if (file.startsWith('blog')) {
		check(
			![...js].some((url) => /simulation|background/i.test(url)),
			`${file}: loads the background simulation`
		);
	}
}

// Sitemap and feed entries must point at built pages.
const locs = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const loc of locs) check(fileFor(loc.slice(ORIGIN.length)), `sitemap: ${loc} not built`);

const rss = read('rss.xml');
check(rss.startsWith('<?xml') && rss.includes('<rss version="2.0"'), 'rss.xml is not RSS 2.0');
const items = [...rss.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)].map((m) => m[1]);
for (const link of items) check(fileFor(link.slice(ORIGIN.length)), `rss: ${link} not built`);

const redirects = read('_redirects').split('\n').filter(Boolean);
for (const line of redirects)
	check(/^\/\S* \S+ 30[12378]$/.test(line), `_redirects: bad line "${line}"`);

// Everything not in any page's initial set is fetched later: article modules (loaded by the
// blog routes' load functions), Mermaid, medium-zoom, and other dynamic imports.
const initial = new Set(jsRows.flatMap((row) => row.chunks));
const onDemand = files.filter(
	(f) => f.startsWith('_app/immutable/') && f.endsWith('.js') && !initial.has(`/${f}`)
);
const onDemandGzip = onDemand.reduce(
	(sum, f) => sum + gzipSync(readFileSync(path.join(BUILD, f))).length,
	0
);

console.table(jsRows.map(({ page, files, kB, gzip_kB }) => ({ page, files, kB, gzip_kB })));
console.log(
	`pages: ${htmlFiles.length}, sitemap URLs: ${locs.length}, feed items: ${items.length}, redirects: ${redirects.length}`
);
console.log(
	`on-demand JS (not in the table): ${onDemand.length} files, ${(onDemandGzip / 1024).toFixed(0)} kB gzip in total`
);

if (errors.length) {
	console.error(`\n${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
	process.exit(1);
}
console.log('\nverify: all checks passed');
