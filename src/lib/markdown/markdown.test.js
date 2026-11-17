import { describe, expect, test } from 'bun:test';
import { compile } from 'mdsvex';
import { mdsvexOptions } from './options.js';
import { injectImports } from './vite-plugin.js';
import { tocText } from './rehype-toc.js';

const md = (source) => compile(source, mdsvexOptions);

describe('math', () => {
	test('KaTeX output is wrapped in {@html} so braces never reach Svelte', async () => {
		const { code } = await md('Inline $\\frac{a}{b}$ and\n\n$$\nx^{2}\n$$\n');
		expect(code).toContain('{@html "<span class=\\"katex\\">');
		expect(code).toContain('katex-display');
		expect(code).not.toMatch(/>\\frac\{a\}\{b\}</);
	});

	test('invalid TeX fails the build', async () => {
		expect(md('$\\frac{a$')).rejects.toThrow('KaTeX');
	});
});

describe('callouts', () => {
	test('[!TYPE] blockquotes become asides; plain blockquotes and links are untouched', async () => {
		const { code } = await md('> [!CAUTION]\n> Careful.\n\n> [link] text\n');
		expect(code).toContain('<aside class="callout callout-caution">');
		expect(code).toContain('<p class="callout-title">Caution</p>');
		expect(code).toContain('<p>Careful.</p>');
		expect(code).toContain('<blockquote>\n<p>[link] text</p>');
	});

	test('unknown types fail the build', async () => {
		expect(md('> [!BOGUS]\n> x')).rejects.toThrow('Unknown callout type');
	});
});

describe('images', () => {
	test('a standalone relative image becomes a linked, captioned enhanced:img figure', async () => {
		const { code, data } = await md('![Alt "text"](./post/fig.png "A caption")\n');
		expect(code).toContain(
			'<figure><a class="zoomable" href={__image0}><enhanced:img src="./post/fig.png" alt="Alt &quot;text&quot;" loading="eager" data-zoom-src={__image0} /></a><figcaption>A caption</figcaption></figure>'
		);
		expect(data.imports).toEqual(['import __image0 from "./post/fig.png?url";']);
	});

	test('later images are lazy, SVGs stay vector, absolute URLs are untouched', async () => {
		const { code } = await md('![a](./a.png)\n\n![b](./b.svg)\n\n![c](https://e.com/c.png)\n');
		expect(code).toContain('<img src={__image1} alt="b" loading="lazy" />');
		expect(code).toContain('<img src="https://e.com/c.png" alt="c">');
	});

	test('missing alt text fails the build', async () => {
		expect(md('![](./x.png)')).rejects.toThrow('no alt text');
	});
});

test('headings shift down a level, link to themselves, and build a nested TOC', async () => {
	const { code, data } = await md('# One\n\n## Two\n\n### Three\n\n## Four\n\n###### Six\n');
	expect(code).toContain('<h2 id="one"><a class="heading-link" href="#one">One</a></h2>');
	expect(code).toContain('<h3 id="two"><a class="heading-link" href="#two">Two</a></h3>');
	expect(code).toContain('<h6 id="six">');
	expect(code).not.toContain('<h1');
	expect(data.fm.toc).toEqual([
		{
			id: 'one',
			text: 'One',
			depth: 2,
			children: [
				{
					id: 'two',
					text: 'Two',
					depth: 3,
					children: [{ id: 'three', text: 'Three', depth: 4, children: [] }]
				},
				{
					id: 'four',
					text: 'Four',
					depth: 3,
					children: [{ id: 'six', text: 'Six', depth: 6, children: [] }]
				}
			]
		}
	]);
	expect(code).toContain('"toc":[');
});

test('footnotes, scrollable tables, and Shiki highlighting', async () => {
	const { code } = await md(
		'Note[^1].\n\n[^1]: Text.\n\n| a |\n|---|\n| b |\n\n```js\nconst o = { a: 1 };\n```\n'
	);
	expect(code).toContain('class="footnotes"');
	expect(code).toContain('<div class="table-scroll"><table>');
	expect(code).toContain('class="shiki shiki-themes catppuccin-latte catppuccin-mocha"');
	expect(code).toContain('light-dark(');
	expect(code).toContain(
		'<div class="code-block"><div class="code-head"><span class="code-lang">js</span></div><pre'
	);
});

test('mermaid blocks become an escaped placeholder; unknown languages fail', async () => {
	const { code } = await md('```mermaid\ngraph TD; A-->B<br>\n```\n');
	expect(code).toContain('<div class="mermaid" data-mermaid=""><pre><code>graph TD; A-->B&lt;br>');
	expect(md('```notalanguage\nx\n```\n')).rejects.toThrow('Unknown code block language');
	expect((await md('```\nplain {x}\n```\n')).code).toContain(
		'class="shiki shiki-themes catppuccin-latte catppuccin-mocha"'
	);
});

test('injectImports targets the module script or creates one', () => {
	expect(injectImports('<script module>\nconst a = 1;</script>', ['import x from "y";'])).toBe(
		'<script module>\nimport x from "y";\nconst a = 1;</script>'
	);
	expect(injectImports('<p>x</p>', ['import x from "y";'])).toBe(
		'<script module>\nimport x from "y";\n</script>\n<p>x</p>'
	);
	expect(injectImports('<p>x</p>', [])).toBe('<p>x</p>');
});

test.each([
	['1. Install Node.js', 'Install Node.js'],
	['2 - Install the Game', 'Install the Game'],
	['3) Run it', 'Run it'],
	['1.2. Nested', 'Nested'],
	['- Dash item', 'Dash item'],
	['* Star item', 'Star item'],
	['The Good:', 'The Good'],
	['4 - Finishing Up and Run!', 'Finishing Up and Run!'],
	['3D graphics', '3D graphics'],
	['2048 clone', '2048 clone'],
	['e-mail - and more', 'e-mail - and more'],
	['Time: 10:30', 'Time: 10:30']
])('TOC text %p becomes %p', (input, output) => {
	expect(tocText(input)).toBe(output);
});
