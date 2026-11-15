<script>
	import Article from '#lib/components/blog/Article.svelte';

	let { data } = $props();
</script>

{#key data.source}
	<Article post={data.post} content={data.content} />
{/key}
