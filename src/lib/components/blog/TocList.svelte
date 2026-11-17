<script>
	import TocList from './TocList.svelte';

	let { items, active = null } = $props();
</script>

<ol>
	{#each items as item (item.id)}
		<li>
			<a href="#{item.id}" aria-current={item.id === active ? 'location' : undefined}>{item.text}</a
			>
			{#if item.children.length}
				<TocList items={item.children} {active} />
			{/if}
		</li>
	{/each}
</ol>
