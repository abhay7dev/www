<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import regularLatin from '../fonts/FiraSans-Regular-latin.woff2?url';
	import Footer from '#lib/components/chrome/Footer.svelte';
	import Header from '#lib/components/chrome/Header.svelte';
	import { routeTransitions } from '#lib/motion/route-transitions.js';

	let { children } = $props();
	let main;

	routeTransitions(() => main);

	// External http(s) links open in a new tab, wherever they come from (articles, components).
	onMount(() => {
		const onclick = (event) => {
			const link = event.target.closest?.('a[href]');
			if (!link || link.target || !/^https?:$/.test(link.protocol)) return;
			if (link.origin === location.origin) return;
			link.target = '_blank';
			link.rel = [...new Set([...link.rel.split(' '), 'noopener', 'noreferrer'])].join(' ').trim();
		};
		document.addEventListener('click', onclick, { capture: true });
		return () => document.removeEventListener('click', onclick, { capture: true });
	});
</script>

<svelte:head>
	<link rel="preload" href={regularLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<Header />

<main id="main" bind:this={main}>
	{@render children()}
</main>

<Footer />
