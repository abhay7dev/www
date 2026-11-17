<script>
	// Scroll-snap carousel: swipes and scrolls without JavaScript. JS adds buttons, dots, arrow
	// keys, and each slide's distance from the center (--p signed, --d absolute, in slide widths),
	// which drives the scale, fade, and parallax in CSS.
	import { onMount } from 'svelte';
	import IconChevronLeft from '@tabler/icons-svelte-runes/icons/chevron-left';
	import IconChevronRight from '@tabler/icons-svelte-runes/icons/chevron-right';

	/** images: [{ picture, alt }] (enhanced-img pictures); label names the carousel. */
	let { images, label } = $props();

	let track;
	let index = $state(0);
	let enhanced = $state(false);
	let frame = 0;

	const smooth = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;

	function measure() {
		frame = 0;
		const slides = [...track.children];
		if (!slides[0]?.offsetWidth) return; // inside a closed dialog
		const center = track.scrollLeft + track.clientWidth / 2;
		let nearest = Infinity;
		for (const [i, slide] of slides.entries()) {
			const p = (slide.offsetLeft + slide.offsetWidth / 2 - center) / slide.offsetWidth;
			slide.style.setProperty('--p', Math.max(-1, Math.min(1, p)).toFixed(3));
			slide.style.setProperty('--d', Math.min(1, Math.abs(p)).toFixed(3));
			if (Math.abs(p) < nearest) {
				nearest = Math.abs(p);
				index = i;
			}
		}
	}
	const schedule = () => (frame ||= requestAnimationFrame(measure));

	function go(i) {
		const slide = track.children[Math.max(0, Math.min(images.length - 1, i))];
		track.scrollTo({
			left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
			behavior: smooth() ? 'smooth' : 'instant'
		});
	}

	function onkeydown(event) {
		const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
		if (!step) return;
		event.preventDefault();
		go(index + step);
	}

	onMount(() => {
		enhanced = true;
		// Also fires when the dialog opens and the track gets a size.
		const resizer = new ResizeObserver(schedule);
		resizer.observe(track);
		return () => {
			resizer.disconnect();
			cancelAnimationFrame(frame);
		};
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section class="carousel" aria-roledescription="carousel" aria-label={label} {onkeydown}>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<ul class="track" bind:this={track} onscroll={schedule} tabindex="0">
		{#each images as image, i (image.picture)}
			<li class="slide" aria-roledescription="slide" aria-label="{i + 1} of {images.length}">
				<enhanced:img
					src={image.picture}
					alt={image.alt}
					sizes="(min-width: 64rem) 72vw, 100vw"
					loading="lazy"
				/>
			</li>
		{/each}
	</ul>
	{#if enhanced && images.length > 1}
		<div class="controls">
			<button
				class="icon-button"
				type="button"
				onclick={() => go(index - 1)}
				disabled={index === 0}
				aria-label="Previous image"
			>
				<IconChevronLeft size={20} stroke={1.75} aria-hidden="true" />
			</button>
			<div class="dots">
				{#each images as image, i (image.picture)}
					<button
						type="button"
						class="dot"
						onclick={() => go(i)}
						aria-label="Show image {i + 1}"
						aria-current={i === index}
					></button>
				{/each}
			</div>
			<button
				class="icon-button"
				type="button"
				onclick={() => go(index + 1)}
				disabled={index === images.length - 1}
				aria-label="Next image"
			>
				<IconChevronRight size={20} stroke={1.75} aria-hidden="true" />
			</button>
		</div>
	{/if}
</section>

<style>
	.track {
		position: relative; /* offsetLeft of slides is measured from here */
		display: flex;
		gap: 1rem;
		margin: 0;
		padding: 0 9%;
		list-style: none;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
	}
	.track::-webkit-scrollbar {
		display: none;
	}
	.track:focus-visible {
		outline-offset: -2px;
	}
	/* A single image fills the width. */
	.slide:only-child {
		flex-basis: 100%;
	}
	.track:has(.slide:only-child) {
		padding: 0;
	}
	.slide {
		flex: 0 0 82%;
		margin: 0;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: var(--radius);
		background: var(--bg-sunken);
		scroll-snap-align: center;
		scale: calc(1 - 0.08 * var(--d, 0));
		opacity: calc(1 - 0.6 * var(--d, 0));
	}
	.slide :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		scale: 1.2; /* room for the parallax shift */
		translate: calc(var(--p, 0) * -8%) 0;
	}
	@media (prefers-reduced-motion: reduce) {
		.slide {
			scale: none;
			opacity: 1;
		}
		.slide :global(img) {
			scale: none;
			translate: none;
		}
	}

	.controls {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
		margin-block-start: 0.75rem;
	}
	.controls .icon-button:disabled {
		opacity: 0.35;
		cursor: default;
		background: transparent;
	}
	.dots {
		display: flex;
		gap: 0.25rem;
	}
	/* 24px hit area around an 8px dot. */
	.dot {
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
	}
	.dot::before {
		content: '';
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--ctp-surface2);
		transition:
			background-color var(--duration) var(--ease-out),
			scale var(--duration) var(--ease-out);
	}
	.dot:hover::before {
		background: var(--text-muted);
	}
	.dot[aria-current='true']::before {
		background: var(--accent);
		scale: 1.25;
	}
</style>
