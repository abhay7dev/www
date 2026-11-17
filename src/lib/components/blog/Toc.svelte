<script>
	import { onMount } from 'svelte';
	import IconList from '@tabler/icons-svelte-runes/icons/list';
	import TocList from './TocList.svelte';

	let { items } = $props();

	let side;
	let inline;
	let floating = $state(false); // the bottom-right button: only after the inline TOC scrolls away
	let active = $state(null); // id of the section being read
	let marker = $state(null); // { y, height } of its link in the side TOC
	let markerReady = $state(false);

	const flatten = (list) => list.flatMap((item) => [item.id, ...flatten(item.children)]);

	// The Lavender marker sits beside the active section's link and slides as it changes.
	$effect(() => {
		const link = active && side?.querySelector(`a[href="#${CSS.escape(active)}"]`);
		marker = link ? { y: link.offsetTop, height: link.offsetHeight } : null;
	});

	onMount(() => {
		const headings = flatten(items)
			.map((id) => document.getElementById(id))
			.filter(Boolean);
		// Active = the last heading scrolled past the top quarter of the screen.
		let frame = 0;
		const update = () => {
			frame = 0;
			const line = innerHeight / 4;
			const passed = headings.filter((h) => h.getBoundingClientRect().top <= line);
			active = passed.at(-1)?.id ?? null;
		};
		const onScroll = () => (frame ||= requestAnimationFrame(update));
		update();
		requestAnimationFrame(() => (markerReady = true));
		const inlineObserver = new IntersectionObserver(([entry]) => {
			floating = !entry.isIntersecting && entry.boundingClientRect.top < 0;
		});
		inlineObserver.observe(inline);
		addEventListener('scroll', onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			removeEventListener('scroll', onScroll);
			inlineObserver.disconnect();
		};
	});
</script>

<!-- Two copies, one per breakpoint; CSS hides the inactive one (display: none also hides it from assistive tech). -->
<details class="toc-inline" bind:this={inline}>
	<summary>Contents</summary>
	<TocList {items} {active} />
</details>
<nav class="toc-side" aria-label="Table of contents" bind:this={side}>
	<p class="toc-title">Contents</p>
	<TocList {items} {active} />
	{#if marker}
		<span
			class="toc-marker"
			class:ready={markerReady}
			style:translate="0 {marker.y}px"
			style:height="{marker.height}px"
		></span>
	{/if}
</nav>

<button
	class="icon-button toc-float"
	type="button"
	popovertarget="toc-popover"
	aria-label="Table of contents"
	data-hidden={floating ? undefined : ''}
	tabindex={floating ? undefined : -1}
>
	<IconList size={18} stroke={1.75} aria-hidden="true" />
</button>
<nav id="toc-popover" class="toc-popover" popover aria-label="Table of contents">
	<p class="toc-title">Contents</p>
	<TocList {items} {active} />
</nav>
