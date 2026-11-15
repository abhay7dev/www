<script>
	import Head from '#lib/components/Head.svelte';
	import PostSummary from './PostSummary.svelte';

	let { group, content: Content } = $props();
</script>

<Head title={group.title} description={group.description} path={group.url} />

<h1>{group.title}</h1>

<Content />

<ul>
	{#each group.posts as post (post.url)}
		<li><PostSummary {post} /></li>
	{/each}
</ul>
