<script>
	import { getContext } from 'svelte';

	let { label, children } = $props();

	const tabs = getContext('tabs');
	if (!tabs) throw new Error('<Tab> must be inside <Tabs>');
	// svelte-ignore state_referenced_locally (tab labels are static)
	const index = tabs.register(label);
	const id = `${tabs.uid}-${index}`;
</script>

<section
	id="{id}-panel"
	class="tab-panel"
	role={tabs.enhanced ? 'tabpanel' : undefined}
	aria-labelledby={tabs.enhanced ? `${id}-tab` : undefined}
	hidden={tabs.enhanced && tabs.selected !== index}
>
	{#if !tabs.enhanced}
		<p class="tab-label"><strong>{label}</strong></p>
	{/if}
	{@render children()}
</section>
