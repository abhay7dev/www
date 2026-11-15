<script>
	// Renders an article for the RSS feed. Interactive components read the `feed` context and
	// render a link to the article instead of themselves.
	import { setContext } from 'svelte';

	let { content: Content, url } = $props();
	// svelte-ignore state_referenced_locally (rendered once per feed item)
	setContext('feed', { url });
</script>

<Content />
