<script>
	// Non-blog pages. The background simulation mounts here, so it keeps running across
	// navigation between these pages and is destroyed on entering /blog (which never loads it).
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import IconPlayerPause from '@tabler/icons-svelte-runes/icons/player-pause';
	import IconPlayerPlay from '@tabler/icons-svelte-runes/icons/player-play';
	import { currentPalette, onThemeChange } from '#lib/theme/theme.js';

	let { children } = $props();
	let canvas;
	let simulation = $state(null);
	let paused = $state(false);
	let motion = $state(false); // the pause control only exists when something can move

	onMount(() => {
		let stopTheme = () => {};
		let cancelled = false;
		const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
		import('#lib/simulation/simulation.js').then(({ start }) => {
			if (cancelled) return;
			simulation = start(canvas, { palette: currentPalette(), reducedMotion });
			if (!simulation) return;
			paused = simulation.paused;
			motion = !reducedMotion;
			stopTheme = onThemeChange(() => simulation.setPalette(currentPalette()));
		});
		return () => {
			cancelled = true;
			stopTheme();
			simulation?.stop();
		};
	});

	function togglePaused() {
		paused = !paused;
		simulation.setPaused(paused);
	}
</script>

<div class="background" class:dim={page.url.pathname !== '/'} aria-hidden="true">
	<canvas bind:this={canvas}></canvas>
</div>

{#if motion}
	<button
		class="icon-button simulation-toggle"
		type="button"
		onclick={togglePaused}
		aria-label={paused ? 'Play background animation' : 'Pause background animation'}
	>
		{#if paused}
			<IconPlayerPlay size={18} stroke={1.75} aria-hidden="true" />
		{:else}
			<IconPlayerPause size={18} stroke={1.75} aria-hidden="true" />
		{/if}
	</button>
{/if}

{@render children()}

<style>
	.background {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		transition: opacity 600ms var(--ease-out);
		animation: background-in 800ms var(--ease-out) backwards;
	}
	/* Dimmed behind text on every non-home page. */
	.dim {
		opacity: 0.15;
	}
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
	/* Homepage first load: the background fades up after the name has typed in. */
	:global(:root:not(.navigated)) .background:not(.dim) {
		animation-delay: 1.1s;
	}
	@keyframes background-in {
		from {
			opacity: 0;
		}
	}

	.simulation-toggle {
		position: fixed;
		right: 1rem;
		bottom: 1rem;
		z-index: 5;
		background: var(--bg-raised);
		border: 1px solid var(--border);
		animation: background-in 400ms var(--ease-out) backwards;
	}
</style>
