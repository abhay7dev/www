<script>
	// Without JavaScript (and in the RSS feed) every panel is shown in order under its label.
	// After hydration this becomes the WAI-ARIA tabs pattern with automatic activation.
	import { onMount, setContext, tick } from 'svelte';

	let { label = 'Tabs', children } = $props();

	const uid = $props.id();
	const tabs = []; // filled by <Tab> children during initialization; read only after mount
	let selected = $state(0);
	let enhanced = $state(false);

	setContext('tabs', {
		uid,
		register(tabLabel) {
			tabs.push(tabLabel);
			return tabs.length - 1;
		},
		get selected() {
			return selected;
		},
		get enhanced() {
			return enhanced;
		}
	});

	onMount(() => {
		enhanced = true;
	});

	async function onkeydown(event) {
		const last = tabs.length - 1;
		const next = {
			ArrowRight: selected === last ? 0 : selected + 1,
			ArrowLeft: selected === 0 ? last : selected - 1,
			Home: 0,
			End: last
		}[event.key];
		if (next === undefined) return;
		event.preventDefault();
		selected = next;
		await tick();
		document.getElementById(`${uid}-${next}-tab`)?.focus();
	}
</script>

<div class="tabs">
	{#if enhanced}
		<div role="tablist" aria-label={label}>
			{#each tabs as tabLabel, i (i)}
				<button
					type="button"
					role="tab"
					id="{uid}-{i}-tab"
					aria-controls="{uid}-{i}-panel"
					aria-selected={i === selected}
					tabindex={i === selected ? 0 : -1}
					onclick={() => (selected = i)}
					{onkeydown}>{tabLabel}</button
				>
			{/each}
		</div>
	{/if}
	{@render children()}
</div>
