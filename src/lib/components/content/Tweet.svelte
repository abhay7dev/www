<script module>
	let widgets;

	function loadWidgets() {
		widgets ??= new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://platform.twitter.com/widgets.js';
			script.async = true;
			script.onload = () => resolve(window.twttr);
			script.onerror = reject;
			document.head.append(script);
		});
		return widgets;
	}
</script>

<script>
	// The quoted post is static HTML (the no-JS and RSS view). With JavaScript, X's widgets.js,
	// loaded only on pages that contain a <Tweet>, upgrades it to the official embed.
	import { onMount } from 'svelte';

	let { url, author, date, children } = $props();

	// svelte-ignore state_referenced_locally (validated once; embeds are static)
	if (!/^https:\/\/(x|twitter)\.com\/\w+\/status\/\d+$/.test(url)) {
		throw new Error(`Invalid X post URL "${url}"`);
	}

	let container = $state();

	onMount(() => {
		let cancelled = false;
		loadWidgets().then((twttr) => {
			if (!cancelled) twttr.widgets.load(container);
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<div class="embed" bind:this={container}>
	<blockquote class="twitter-tweet">
		<p>{@render children()}</p>
		— {author} <a href={url}>{date}</a>
	</blockquote>
</div>
