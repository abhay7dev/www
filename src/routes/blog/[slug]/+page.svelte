<script>
	import Article from '#lib/components/blog/Article.svelte';
	import GroupPage from '#lib/components/blog/GroupPage.svelte';

	let { data } = $props();
</script>

<!-- Keyed so client-side navigation between posts remounts article enhancements. -->
{#key data.source}
	{#if data.kind === 'post'}
		<Article post={data.post} content={data.content} />
	{:else}
		<GroupPage group={data.group} content={data.content} />
	{/if}
{/key}
