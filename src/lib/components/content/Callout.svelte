<script>
	// Same markup as the `> [!TYPE]` Markdown syntax.
	import { CALLOUT_TYPES } from '#lib/markdown/callout-types.js';

	let { type = 'note', title, children } = $props();

	// svelte-ignore state_referenced_locally
	if (!(type in CALLOUT_TYPES)) throw new Error(`Unknown callout type "${type}"`);
</script>

<aside class="callout callout-{type}">
	<p class="callout-title">{title ?? CALLOUT_TYPES[type]}</p>
	{@render children?.()}
</aside>
