import { expect, test } from 'bun:test';
import { buildRedirects } from './redirects.js';

const post = (url, redirectFrom) => ({ url, source: `${url}.svx`, redirectFrom });

test('merges site and post rules, static before dynamic', () => {
	const out = buildRedirects({
		siteRules: '# comment\n/tags/* /blog 301\n/posts /blog\n',
		posts: [post('/blog/a', ['/posts/a/'])],
		livePaths: ['/blog', '/blog/a']
	});
	expect(out).toBe('/posts /blog 301\n/posts/a/ /blog/a 301\n/tags/* /blog 301\n');
});

test('rejects duplicates, live sources, and malformed rules', () => {
	const build = (siteRules, posts = [], livePaths = []) =>
		buildRedirects({ siteRules, posts, livePaths });
	expect(() => build('/x /a', [post('/blog/b', ['/x'])])).toThrow('already redirected');
	expect(() => build('', [post('/blog/b', ['/about/'])], ['/about'])).toThrow('live page');
	expect(() => build('x /a')).toThrow('must start with /');
	expect(() => build('/x /a 200')).toThrow('unsupported status');
	expect(() => build('/x')).toThrow('expected');
});
