<script>
	// Click-to-load: nothing is requested from YouTube until the reader chooses to play.
	// Without JavaScript, and in the RSS feed, this is just a link.
	import { getContext, onMount } from 'svelte';

	let { id, title } = $props();

	// svelte-ignore state_referenced_locally (validated once; embeds are static)
	if (!/^[\w-]{11}$/.test(id)) throw new Error(`Invalid YouTube video id "${id}"`);
	// svelte-ignore state_referenced_locally
	if (!title) throw new Error('<YouTube> needs a title');

	const inFeed = Boolean(getContext('feed'));
	let enhanced = $state(false);
	let playing = $state(false);

	onMount(() => {
		enhanced = true;
	});
</script>

<figure class="embed">
	{#if playing}
		<iframe
			src="https://www.youtube-nocookie.com/embed/{id}?autoplay=1"
			{title}
			width="560"
			height="315"
			allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
			allowfullscreen
		></iframe>
	{:else}
		<p><a href="https://www.youtube.com/watch?v={id}">Watch “{title}” on YouTube</a></p>
		{#if enhanced && !inFeed}
			<button type="button" onclick={() => (playing = true)}>Play video here</button>
		{/if}
	{/if}
</figure>
