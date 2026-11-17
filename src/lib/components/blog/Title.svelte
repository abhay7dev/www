<script>
	import { titleParts } from '#lib/blog/format.js';

	let { text } = $props();
</script>

{#each titleParts(text) as part, i (i)}{#if part.code}<code>{part.text}</code
		>{:else}{part.text}{/if}{/each}
