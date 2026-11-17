<script>
	// giscus comments via its web component (npm `giscus`), which creates the giscus.app iframe
	// itself: no third-party script runs on this origin. The component and the iframe load only
	// when the section approaches the viewport.
	import { onMount } from 'svelte';
	import { giscusTheme } from '#lib/blog/giscus-theme.js';
	import { giscus } from '#lib/site.js';
	import { currentTheme, onThemeChange } from '#lib/theme/theme.js';

	let { term } = $props();

	const configured = Boolean(giscus.repoId && giscus.categoryId);
	let container = $state();
	let ready = $state(false);
	let theme = $state('');

	onMount(() => {
		if (!configured) return;
		theme = giscusTheme(currentTheme());
		// Changing the attribute makes the widget re-theme its iframe without reloading.
		const stopTheme = onThemeChange((next) => (theme = giscusTheme(next)));
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				import('giscus').then(() => (ready = true));
			},
			{ rootMargin: '400px' }
		);
		observer.observe(container);
		return () => {
			observer.disconnect();
			stopTheme();
		};
	});
</script>

{#if configured}
	<section class="comments" aria-labelledby="comments-heading" bind:this={container}>
		<h2 id="comments-heading">Comments</h2>
		<noscript><p>Comments need JavaScript (they are loaded from GitHub Discussions).</p></noscript>
		{#if ready}
			<!-- mapping "specific" + strict: the discussion is found by the exact post slug, which
			     survives URL changes (e.g. moving a post into a group). -->
			<giscus-widget
				repo={giscus.repo}
				repoid={giscus.repoId}
				category={giscus.category}
				categoryid={giscus.categoryId}
				mapping="specific"
				{term}
				strict="1"
				reactionsenabled="1"
				emitmetadata="0"
				inputposition="top"
				{theme}
				lang="en"
				loading="lazy"
			></giscus-widget>
		{/if}
	</section>
{/if}
