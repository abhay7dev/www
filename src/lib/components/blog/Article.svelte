<script>
	import 'katex/dist/katex.min.css';
	import { onMount } from 'svelte';
	import Head from '#lib/components/Head.svelte';
	import Comments from './Comments.svelte';
	import Toc from './Toc.svelte';
	import { enhanceDiagrams, enhanceImages } from '#lib/blog/enhance.js';
	import { formatDate } from '#lib/blog/format.js';

	let { post, content: Content } = $props();
	let body;

	onMount(() => {
		const cleanups = [enhanceImages(body), enhanceDiagrams(body)];
		return () => cleanups.forEach((cleanup) => cleanup());
	});
</script>

<Head
	title={post.title}
	description={post.description}
	path={post.url}
	type="article"
	image="/og/{post.slug}.png"
	published={post.date}
	modified={post.updated}
/>

<article class="article">
	<header class="article-header">
		<h1>{post.title}</h1>
		<p>
			<time datetime={post.date}>{formatDate(post.date)}</time>
			{#if post.updated}
				· Updated <time datetime={post.updated}>{formatDate(post.updated)}</time>
			{/if}
		</p>
	</header>

	{#if post.toc.length}
		<Toc items={post.toc} />
	{/if}

	<div class="article-body" bind:this={body}>
		<Content />
	</div>

	<Comments term={post.slug} />
</article>
