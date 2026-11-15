<script>
	// Wrap inline interactive demos in articles. In the RSS feed the demo is replaced by a link to
	// the article, since feed readers do not run JavaScript.
	import { getContext } from 'svelte';

	let { label = 'interactive demo', children } = $props();

	const feed = getContext('feed');
</script>

{#if feed}
	<p><a href={feed.url}>View this {label} on abhay7.dev</a></p>
{:else}
	{@render children()}
{/if}
