<script>
	import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';
	import Head from '#lib/components/Head.svelte';
	import PostSummary from './PostSummary.svelte';
	import Title from './Title.svelte';
	import { plainTitle } from '#lib/blog/format.js';

	let { group, content: Content } = $props();
</script>

<Head title={plainTitle(group.title)} description={group.description} path={group.url} />

<a class="back-link" href="/blog"
	><IconArrowLeft size={16} stroke={1.75} aria-hidden="true" />Blog</a
>

<h1><Title text={group.title} /></h1>

<Content />

<ul class="post-list">
	{#each group.posts as post, i (post.url)}
		<li class="card" style:--i={i}><PostSummary {post} /></li>
	{/each}
</ul>
