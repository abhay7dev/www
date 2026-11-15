import { expect, test } from 'bun:test';
import katex from 'katex';
import { absolutize, keepMathml, toFeedHtml } from './html.js';
import { buildRss, buildSitemap, escapeXml } from './xml.js';

test('keepMathml strips the KaTeX HTML layer and keeps MathML', () => {
	const math = katex.renderToString('\\frac{a}{b}', { displayMode: true });
	const out = keepMathml(`<p>before</p>${math}<p>after</p>`);
	expect(out).toContain('<math');
	expect(out).not.toContain('katex-html');
	expect(out.startsWith('<p>before</p>')).toBe(true);
	expect(out.endsWith('<p>after</p>')).toBe(true);
});

test('absolutize rewrites root-relative URLs only', () => {
	const html =
		'<img src="/a.png" srcset="/a.avif 1x, /b.avif 2x"><a href="/blog/x">x</a><a href="//cdn.x/y">c</a><a href="https://e.com">e</a><a href="#f">f</a>';
	expect(absolutize(html, 'https://abhay7.dev')).toBe(
		'<img src="https://abhay7.dev/a.png" srcset="https://abhay7.dev/a.avif 1x, https://abhay7.dev/b.avif 2x"><a href="https://abhay7.dev/blog/x">x</a><a href="//cdn.x/y">c</a><a href="https://e.com">e</a><a href="#f">f</a>'
	);
});

test('toFeedHtml drops hydration comments and replaces diagrams with a link', () => {
	const html =
		'<!--[--><p>Hi</p><div class="mermaid" data-mermaid=""><pre><code>graph TD</code></pre></div><!--]-->';
	expect(toFeedHtml(html, { origin: 'https://abhay7.dev', url: 'https://abhay7.dev/blog/x' })).toBe(
		'<p>Hi</p><p><a href="https://abhay7.dev/blog/x">View this diagram on abhay7.dev</a></p>'
	);
});

test('buildRss escapes text and protects CDATA', () => {
	const xml = buildRss(
		{ title: 'A & B', description: 'd', origin: 'https://abhay7.dev', feedPath: '/rss.xml' },
		[{ title: '<T>', url: '/blog/t', date: '2026-01-02', description: '"q"', html: 'x ]]> y' }]
	);
	expect(xml).toContain('<title>A &amp; B</title>');
	expect(xml).toContain('<title>&lt;T&gt;</title>');
	expect(xml).toContain('<pubDate>Fri, 02 Jan 2026 00:00:00 GMT</pubDate>');
	expect(xml).toContain('<![CDATA[x ]]]]><![CDATA[> y]]>');
	expect(xml).toContain('<link>https://abhay7.dev/blog/t</link>');
});

test('buildSitemap lists absolute URLs', () => {
	const xml = buildSitemap('https://abhay7.dev', [
		{ path: '/' },
		{ path: '/blog/a', lastmod: '2026-01-01' }
	]);
	expect(xml).toContain('<url><loc>https://abhay7.dev/</loc></url>');
	expect(xml).toContain('<loc>https://abhay7.dev/blog/a</loc><lastmod>2026-01-01</lastmod>');
	expect(escapeXml(`'`)).toBe('&apos;');
});
