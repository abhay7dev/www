<script>
	// Giscus comments, loaded only when the section approaches the viewport.
	import { onMount } from 'svelte';
	import { giscus } from '#lib/site.js';

	let { term } = $props();

	const configured = Boolean(giscus.repoId && giscus.categoryId);
	let container = $state();
	let slot = $state();

	onMount(() => {
		if (!configured) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				const script = document.createElement('script');
				script.src = 'https://giscus.app/client.js';
				script.async = true;
				script.crossOrigin = 'anonymous';
				const data = {
					repo: giscus.repo,
					'repo-id': giscus.repoId,
					category: giscus.category,
					'category-id': giscus.categoryId,
					mapping: 'specific',
					term,
					strict: '1',
					'reactions-enabled': '1',
					'emit-metadata': '0',
					'input-position': 'top',
					theme: 'preferred_color_scheme',
					lang: 'en'
				};
				for (const [key, value] of Object.entries(data)) script.setAttribute(`data-${key}`, value);
				// giscus replaces this script with its iframe; Svelte renders nothing else in here.
				// eslint-disable-next-line svelte/no-dom-manipulating
				slot.append(script);
			},
			{ rootMargin: '400px' }
		);
		observer.observe(container);
		return () => observer.disconnect();
	});
</script>

{#if configured}
	<section class="comments" aria-labelledby="comments-heading" bind:this={container}>
		<h2 id="comments-heading">Comments</h2>
		<noscript><p>Comments need JavaScript (they are loaded from GitHub Discussions).</p></noscript>
		<div bind:this={slot}></div>
	</section>
{/if}
