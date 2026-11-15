<script>
	import Head from '#lib/components/Head.svelte';
	import { site } from '#lib/site.js';
	import firaSansOfl from '../../../fonts/OFL-FiraSans.txt?raw';
	import firaCodeOfl from '../../../fonts/OFL-FiraCode.txt?raw';

	// Third-party software and assets delivered to readers' browsers.
	const thirdParty = [
		{
			name: 'Svelte and SvelteKit runtime',
			license: 'MIT',
			url: 'https://github.com/sveltejs/svelte'
		},
		{
			name: 'KaTeX (math styles and fonts)',
			license: 'MIT',
			url: 'https://github.com/KaTeX/KaTeX'
		},
		{
			name: 'medium-zoom',
			license: 'MIT',
			url: 'https://github.com/francoischalifour/medium-zoom'
		},
		{
			name: 'Mermaid and its bundled dependencies',
			license: 'MIT (see the project for dependency licenses)',
			url: 'https://github.com/mermaid-js/mermaid'
		},
		{
			name: 'Catppuccin Mocha palette and code theme (via Shiki)',
			license: 'MIT',
			url: 'https://github.com/catppuccin/catppuccin'
		}
	];
</script>

<Head
	title="Licenses"
	description="Licenses for this site's content, code, and third-party material."
	path="/licenses"
/>

<h1>Licenses</h1>

<h2>Content</h2>
<p>
	Unless otherwise noted, original article prose and illustrations are © 2026 Abhay Bhat and
	licensed under
	<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
		>Creative Commons Attribution–NonCommercial–ShareAlike 4.0 International</a
	>.
</p>

<h2>Code samples in articles</h2>
<p>Code samples presented in articles are licensed under the MIT License:</p>
<details>
	<summary>MIT License</summary>
	<pre>Copyright (c) 2026 Abhay Bhat

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</pre>
</details>

<h2>Website source code</h2>
<p>
	The website's implementation code, including executable components and interactive demos, is
	licensed under the <a href="{site.repo}/blob/main/LICENSE">GNU Affero General Public License</a>.
	The source is available at <a href={site.repo}>{site.repo}</a>.
</p>

<h2>Third-party material</h2>
<p>Third-party material retains its respective license.</p>

<h3>Fonts</h3>
<details>
	<summary>Fira Sans — SIL Open Font License 1.1</summary>
	<pre>{firaSansOfl}</pre>
</details>
<details>
	<summary>Fira Code — SIL Open Font License 1.1</summary>
	<pre>{firaCodeOfl}</pre>
</details>

<h3>Software</h3>
<ul>
	{#each thirdParty as item (item.name)}
		<li><a href={item.url}>{item.name}</a> — {item.license}</li>
	{/each}
</ul>
