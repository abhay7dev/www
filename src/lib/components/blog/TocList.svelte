<script>
	import TocList from './TocList.svelte';

	let { items } = $props();
</script>

<ol>
	{#each items as item (item.id)}
		<li>
			<a href="#{item.id}">{item.text}</a>
			{#if item.children.length}
				<TocList items={item.children} />
			{/if}
		</li>
	{/each}
</ol>
