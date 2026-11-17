import { describe, expect, test } from 'bun:test';
import { buildProjects } from './model.js';

const project = (date, extra = {}) => ({ title: 'T', description: 'D', date, ...extra });
const build = (metadata, files = Object.keys(metadata), extra = {}) =>
	buildProjects({ files, metadata, today: '2026-11-15', includeDrafts: false, ...extra });

describe('projects', () => {
	test('sorts newest first, then by slug, and drops drafts', () => {
		const projects = build({
			'b.svx': project('2026-01-01'),
			'a.svx': project('2026-01-01'),
			'new.svx': project('2026-05-01'),
			'draft.svx': project('2026-06-01', { draft: true })
		});
		expect(projects.map((p) => p.slug)).toEqual(['new', 'a', 'b']);
	});

	test('resolves images in the project folder and normalizes links', () => {
		const [p] = build(
			{
				'x.svx': project('2026-01-01', {
					images: [{ src: 'shot.png', alt: 'A shot' }],
					stack: ['Svelte'],
					links: { repo: 'https://example.com/x' }
				})
			},
			['x.svx', 'x/shot.png']
		);
		expect(p.images).toEqual([{ src: 'x/shot.png', alt: 'A shot' }]);
		expect(p.links).toEqual({ repo: 'https://example.com/x', live: null });
		expect(p.stack).toEqual(['Svelte']);
	});

	test.each([
		['a missing image file', { images: [{ src: 'gone.png', alt: 'A' }] }, /does not exist/],
		['missing alt text', { images: [{ src: 'shot.png' }] }, /images\[\]\.alt/],
		['an SVG image', { images: [{ src: 'shot.svg', alt: 'A' }] }, /raster/],
		['a non-https link', { links: { repo: 'http://example.com' } }, /https/],
		['an unknown link', { links: { docs: 'https://example.com' } }, /unknown link/],
		['an unknown field', { tags: [] }, /unknown frontmatter/],
		['a future date', { date: '2027-01-01' }, /future/]
	])('fails on %s', (_, extra, message) => {
		const meta = { 'x.svx': project('2026-01-01', extra) };
		expect(() => build(meta, ['x.svx', 'x/shot.png', 'x/shot.svg'])).toThrow(message);
	});

	test('fails on stray files', () => {
		expect(() => build({}, ['notes.md'])).toThrow(/only <slug>\.svx/);
		expect(() => build({}, ['orphan/shot.png'])).toThrow(/only <slug>\.svx/);
	});
});

describe('heading ids', () => {
	const heading = (id) => ({ id, text: id, depth: 2, children: [] });

	test('may not repeat across projects', () => {
		const meta = {
			'a.svx': project('2026-01-01', { toc: [heading('overview')] }),
			'b.svx': project('2026-01-02', {
				toc: [{ ...heading('setup'), children: [heading('overview')] }]
			})
		};
		expect(() => build(meta)).toThrow(
			/a\.svx: heading id "#overview" is already used by a heading in project "b"/
		);
	});

	test("may not clash with the page's own ids", () => {
		const meta = {
			'a.svx': project('2026-01-01'),
			'b.svx': project('2026-01-02', { toc: [heading('a-card')] })
		};
		expect(() => build(meta)).toThrow(/"#a-card" is already used by project "a"/);
		expect(() => build({ 'c.svx': project('2026-01-01', { toc: [heading('main')] }) })).toThrow(
			/the page layout/
		);
	});

	test('distinct ids pass', () => {
		const meta = {
			'a.svx': project('2026-01-01', { toc: [heading('alpha')] }),
			'b.svx': project('2026-01-02', { toc: [heading('beta')] })
		};
		expect(build(meta).map((p) => p.slug)).toEqual(['b', 'a']);
	});
});
