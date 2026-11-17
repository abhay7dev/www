<script>
	import 'katex/dist/katex.min.css';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
	import Head from '#lib/components/Head.svelte';
	import Comments from './Comments.svelte';
	import Toc from './Toc.svelte';
	import { enhanceCode, enhanceDiagrams, enhanceImages } from '#lib/blog/enhance.js';
	import { formatDate, plainTitle } from '#lib/blog/format.js';
	import Title from './Title.svelte';

	// back: the group for grouped posts; standalone posts go back to the blog.
	let { post, content: Content, back = { title: 'Blog', url: '/blog' } } = $props();
	let article;
	let body;

	// In-page links (table of contents, headings, footnotes) glide to their target instead of
	// jumping. The URL still gets the #hash, and focus moves there for keyboard users.
	function onclick(event) {
		const link = event.target.closest('a[href^="#"]');
		if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
		const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
		if (!target) return;
		event.preventDefault();
		link.closest('[popover]')?.hidePopover(); // the floating contents closes on selection
		goto(link.hash, { noScroll: true, keepFocus: true });
		const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
		target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
		if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
		target.focus({ preventScroll: true });
	}

	onMount(() => {
		const cleanups = [enhanceImages(body), enhanceDiagrams(body), enhanceCode(body)];
		article.addEventListener('click', onclick);
		return () => {
			article.removeEventListener('click', onclick);
			cleanups.forEach((cleanup) => cleanup());
		};
	});
</script>

<Head
	title={plainTitle(post.title)}
	description={post.description}
	path={post.url}
	type="article"
	image="/og/{post.slug}.png"
	published={post.date}
	modified={post.updated}
/>

<article class="article" bind:this={article}>
	<header class="article-header">
		<a class="back-link" href={back.url}>
			<IconArrowLeft size={16} stroke={1.75} aria-hidden="true" /><Title text={back.title} />
		</a>
		<h1><Title text={post.title} /></h1>
		<p class="article-meta">
			<time datetime={post.date}>{formatDate(post.date)}</time>
			{#if post.updated}
				<span>Updated <time datetime={post.updated}>{formatDate(post.updated)}</time></span>
			{/if}
		</p>
		<p class="lede">{post.description}</p>
	</header>

	{#if post.toc.length}
		<Toc items={post.toc} />
	{/if}

	<div class="article-body" bind:this={body}>
		<Content />
	</div>

	<Comments term={post.slug} />
</article>
