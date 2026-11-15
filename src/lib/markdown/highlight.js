import { escapeSvelte } from 'mdsvex';
import { bundledLanguages, createHighlighter } from 'shiki';

const THEME = 'catppuccin-mocha';
const PLAIN = new Set(['', 'text', 'txt', 'plain', 'plaintext']);

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const asSvelte = (html) => `{@html \`${escapeSvelte(html)}\`}`;

let highlighter;

/**
 * mdsvex code-block highlighter: Shiki at build time; ```mermaid blocks become a placeholder
 * that the article enhances in the browser (the source stays visible without JavaScript).
 * Unknown languages fail the build so typos are caught.
 */
export async function highlight(code, lang) {
	lang = (lang ?? '').toLowerCase(); // mdsvex passes null for untagged blocks
	if (lang === 'mermaid') {
		return asSvelte(
			`<div class="mermaid" data-mermaid=""><pre><code>${escapeHtml(code)}</code></pre></div>`
		);
	}
	highlighter ??= createHighlighter({ themes: [THEME], langs: [] });
	const shiki = await highlighter;
	if (!PLAIN.has(lang)) {
		if (!(lang in bundledLanguages)) throw new Error(`Unknown code block language "${lang}"`);
		if (!shiki.getLoadedLanguages().includes(lang)) await shiki.loadLanguage(lang);
	}
	return asSvelte(shiki.codeToHtml(code, { lang: PLAIN.has(lang) ? 'text' : lang, theme: THEME }));
}
