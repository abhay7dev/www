import { describe, expect, test } from 'bun:test';
import { buildIndex, classify, parseDate } from './model.js';

const post = (date, extra = {}) => ({ title: 'T', description: 'D', date, ...extra });
const group = { title: 'Group', description: 'G' };
const build = (metadata, extra = {}) =>
	buildIndex({
		files: Object.keys(metadata),
		metadata,
		today: '2026-11-15',
		includeDrafts: false,
		...extra
	});

describe('listing order', () => {
	test('interleaves posts and groups by newest date, groups keep posts together', () => {
		const { listing } = build({
			'standalone-a.svx': post('2026-11-14'),
			'standalone-b.svx': post('2026-11-10'),
			'graphics/index.svx': group,
			'graphics/newest.svx': post('2026-11-12'),
			'graphics/older.svx': post('2026-11-08'),
			'website/index.svx': group,
			'website/a.svx': post('2026-11-05'),
			'website/b.svx': post('2026-10-28')
		});
		expect(listing.map((e) => [e.kind, e.slug, e.date])).toEqual([
			['post', 'standalone-a', '2026-11-14'],
			['group', 'graphics', '2026-11-12'],
			['post', 'standalone-b', '2026-11-10'],
			['group', 'website', '2026-11-05']
		]);
		expect(listing[1].posts.map((p) => p.slug)).toEqual(['newest', 'older']);
		expect(listing[1].posts[0].url).toBe('/blog/graphics/newest');
	});

	test('equal dates fall back to slug order', () => {
		const { listing } = build({ 'b.svx': post('2026-01-01'), 'a.svx': post('2026-01-01') });
		expect(listing.map((e) => e.slug)).toEqual(['a', 'b']);
	});

	test('drafts are hidden in production and a draft-only group disappears', () => {
		const metadata = {
			'live.svx': post('2026-01-01'),
			'wip.svx': post('2026-02-01', { draft: true }),
			'g/index.svx': group,
			'g/only-draft.svx': post('2026-03-01', { draft: true })
		};
		expect(build(metadata).listing.map((e) => e.slug)).toEqual(['live']);
		expect(build(metadata, { includeDrafts: true }).listing.map((e) => e.slug)).toEqual([
			'g',
			'wip',
			'live'
		]);
	});

	test('a group is dated by its newest visible post', () => {
		const { groups } = build({
			'g/index.svx': group,
			'g/old.svx': post('2025-01-01'),
			'g/new-draft.svx': post('2026-01-01', { draft: true })
		});
		expect(groups[0].date).toBe('2025-01-01');
	});
});

describe('validation failures', () => {
	const fails = (metadata, message) => expect(() => build(metadata)).toThrow(message);

	test('future dates on non-drafts', () => {
		fails({ 'a.svx': post('2026-11-16') }, 'in the future');
		fails({ 'a.svx': post('2026-01-01', { updated: '2026-12-01' }) }, 'in the future');
		expect(() => build({ 'a.svx': post('2027-01-01', { draft: true }) })).not.toThrow();
	});

	test('missing or malformed fields', () => {
		fails({ 'a.svx': { title: 'T', date: '2026-01-01' } }, '"description" is required');
		fails({ 'a.svx': post('2026-01-01', { description: 'two\nlines' }) }, 'single line');
		fails({ 'a.svx': post('2026-02-30') }, 'not a real calendar date');
		fails({ 'a.svx': post('Jan 1') }, 'YYYY-MM-DD');
		fails({ 'a.svx': post('2026-02-01', { updated: '2026-01-01' }) }, 'earlier than');
		fails({ 'a.svx': post('2026-01-01', { descripton: 'typo' }) }, 'unknown frontmatter field');
		fails({ 'a.svx': post('2026-01-01', { redirect_from: ['no-slash'] }) }, 'redirect_from');
	});

	test('slug collisions, reserved names, and bad slugs', () => {
		fails(
			{ 'x.svx': post('2026-01-01'), 'g/index.svx': group, 'g/x.svx': post('2026-01-01') },
			'already used'
		);
		fails(
			{ 'g.svx': post('2026-01-01'), 'g/index.svx': group, 'g/a.svx': post('2026-01-01') },
			'both a post and a group'
		);
		fails({ '404.svx': post('2026-01-01') }, 'reserved');
		fails({ 'Bad_Name.svx': post('2026-01-01') }, 'lowercase');
	});
});

describe('classify', () => {
	test('asset folders, groups, and grouped asset folders', () => {
		const result = classify([
			'a.svx',
			'a/fig.png',
			'a/deep/x.png',
			'g/index.svx',
			'g/p.svx',
			'g/p/img.png'
		]);
		expect(result.posts.map((p) => p.source)).toEqual(['a.svx', 'g/p.svx']);
		expect(result.groups).toEqual([{ source: 'g/index.svx', name: 'g' }]);
	});

	test('rejects stray folders, stray files, nested groups, and a root index', () => {
		expect(() => classify(['stray/x.png'])).toThrow('neither a group');
		expect(() => classify(['notes.txt'])).toThrow('only .svx');
		expect(() => classify(['g/index.svx', 'g/img.png'])).toThrow('only .svx');
		expect(() => classify(['g/index.svx', 'g/h/index.svx'])).toThrow('cannot be nested');
		expect(() => classify(['g/index.svx', 'g/h/x.png'])).toThrow('not an asset folder');
		expect(() => classify(['index.svx'])).toThrow('cannot have an index.svx');
	});
});

test('parseDate accepts mdsvex midnight-UTC strings', () => {
	expect(parseDate('2024-06-26T00:00:00.000Z', 'f', 'date')).toBe('2024-06-26');
	expect(() => parseDate('2023-04-08T17:27:53.000Z', 'f', 'date')).toThrow('YYYY-MM-DD');
});
