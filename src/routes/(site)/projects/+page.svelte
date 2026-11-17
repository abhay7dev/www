<script>
	// Project grid. Each card opens its project in a <dialog> (morphing from the card with a View
	// Transition) and pushes /projects#<slug>, so the back button closes it. Without JavaScript the
	// card links to #<slug> and CSS :target shows the same, prerendered dialog as an overlay.
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import IconCode from '@tabler/icons-svelte-runes/icons/code';
	import IconWorld from '@tabler/icons-svelte-runes/icons/world';
	import IconX from '@tabler/icons-svelte-runes/icons/x';
	import Head from '#lib/components/Head.svelte';
	import Carousel from '#lib/components/projects/Carousel.svelte';

	let { data } = $props();

	// imgSizes makes enhanced-img emit width-based srcsets, used with each <img>'s sizes.
	const pictures = import.meta.glob(
		'/src/content/projects/*/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}',
		{ eager: true, import: 'default', query: { enhanced: true, imgSizes: '1' } }
	);
	const picture = (src) => pictures[`/src/content/projects/${src}`];

	let enhanced = $state(false); // hydrated: dialogs replace the :target fallback
	let shown = null; // slug of the open dialog

	const motion = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
	const dialogOf = (slug) => document.getElementById(slug);
	const cardOf = (slug) => document.getElementById(`${slug}-card`);

	// Morphs `from` into `to` while `update` swaps them; instant without support or motion.
	function morph(from, to, update) {
		if (!document.startViewTransition || !motion() || !from || !to) return update();
		from.style.viewTransitionName = 'project';
		const transition = document.startViewTransition(() => {
			from.style.viewTransitionName = '';
			update();
			to.style.viewTransitionName = 'project';
		});
		transition.finished.finally(() => (to.style.viewTransitionName = ''));
	}

	function show(slug) {
		const dialog = dialogOf(slug);
		if (dialog && !dialog.open) morph(cardOf(slug), dialog, () => dialog.showModal());
	}
	function hide(slug) {
		const dialog = dialogOf(slug);
		if (dialog?.open) morph(dialog, cardOf(slug), () => dialog.close());
	}

	// page.state.project is the single source of truth: clicks, Escape, and back/forward all
	// change it, and this effect opens or closes dialogs to match.
	$effect(() => {
		const next = page.state.project ?? null;
		if (next === shown) return;
		if (shown) hide(shown);
		if (next) show(next);
		shown = next;
	});

	function open(event, slug) {
		if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
		event.preventDefault();
		goto(`#${slug}`, { shallow: true, state: { project: slug, pushed: true } });
	}
	function close() {
		// Opened from a card: going back restores the previous entry (and its scroll position).
		if (page.state.pushed) history.back();
		else goto('/projects', { shallow: true, replace: true, state: {} });
	}

	// Arriving at /projects#<slug>: scroll to the card, then open it.
	afterNavigate(({ to }) => {
		const slug = decodeURIComponent(to?.url.hash.slice(1) ?? '');
		if (page.state.project || !data.projects.some((project) => project.slug === slug)) return;
		cardOf(slug).scrollIntoView({ block: 'center', behavior: motion() ? 'smooth' : 'instant' });
		// shortcut: fixed delay for the scroll (+150ms pause); use scrollend once Safari ships it.
		setTimeout(
			() => goto('', { shallow: true, replace: true, state: { project: slug } }),
			motion() ? 550 : 0
		);
	});

	function oncancel(event) {
		event.preventDefault(); // close through the history, like every other way out
		close();
	}
	// The browser can still force a dialog shut (repeated Escape); keep the URL in step.
	const onclose = (slug) => page.state.project === slug && close();

	function onclick(event) {
		const dialog = event.currentTarget;
		if (event.target === dialog) return close(); // the backdrop
		// In-page links (headings, footnotes) scroll within this dialog instead of navigating,
		// which would close it.
		const link = event.target.closest('a[href^="#"]');
		if (!link) return;
		event.preventDefault();
		dialog
			.querySelector(`#${CSS.escape(decodeURIComponent(link.hash.slice(1)))}`)
			?.scrollIntoView({ behavior: motion() ? 'smooth' : 'instant' });
	}

	onMount(() => (enhanced = true));
</script>

<Head
	title="Projects"
	description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
	path="/projects"
/>

<h1>Projects</h1>

<ul class="project-grid" class:enhanced>
	{#each data.projects as project, i (project.slug)}
		{@const { slug, title, description, images, stack, links, Body } = project}
		<li style:--i={i}>
			<a class="project-card" id="{slug}-card" href="#{slug}" onclick={(e) => open(e, slug)}>
				<div class="thumb">
					{#if images.length}
						<enhanced:img
							src={picture(images[0].src)}
							alt=""
							sizes="(min-width: 64rem) 24rem, (min-width: 40rem) 50vw, 8rem"
							loading={i < 3 ? 'eager' : 'lazy'}
						/>
					{:else}
						<img
							src="/projects/{slug}.png"
							alt=""
							width="1200"
							height="675"
							loading={i < 3 ? 'eager' : 'lazy'}
						/>
					{/if}
				</div>
				<div class="info">
					<h2><span>{title}</span></h2>
					<p class="description">{description}</p>
					{#if stack.length}
						<ul class="stack">
							{#each stack as item (item)}<li>{item}</li>{/each}
						</ul>
					{/if}
				</div>
			</a>

			<dialog
				id={slug}
				class="project-dialog"
				aria-labelledby="{slug}-title"
				{oncancel}
				onclose={() => onclose(slug)}
				{onclick}
			>
				<div class="dialog-scroll">
					{#if enhanced}
						<button class="icon-button close" type="button" onclick={close} aria-label="Close">
							<IconX size={20} stroke={1.75} aria-hidden="true" />
						</button>
					{:else}
						<a class="icon-button close" href="#{slug}-card" aria-label="Close">
							<IconX size={20} stroke={1.75} aria-hidden="true" />
						</a>
					{/if}
					{#if images.length}
						<Carousel
							label="{title} screenshots"
							images={images.map(({ src, alt }) => ({ picture: picture(src), alt }))}
						/>
					{/if}
					<div class="dialog-text">
						<h2 id="{slug}-title">{title}</h2>
						{#if stack.length}
							<ul class="stack">
								{#each stack as item (item)}<li>{item}</li>{/each}
							</ul>
						{/if}
						{#if links.repo || links.live}
							<p class="links">
								{#if links.repo}
									<a href={links.repo}
										><IconCode size={18} stroke={1.75} aria-hidden="true" />Source</a
									>
								{/if}
								{#if links.live}
									<a href={links.live}
										><IconWorld size={18} stroke={1.75} aria-hidden="true" />Website</a
									>
								{/if}
							</p>
						{/if}
						<div class="body"><Body /></div>
					</div>
				</div>
			</dialog>
		</li>
	{/each}
</ul>

<style>
	/* Grid: 3 columns ≥ 64rem, 2 from 40rem, rows with the thumbnail beside the text on phones. */
	.project-grid {
		display: grid;
		gap: 1rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.project-grid > li {
		margin: 0;
	}
	@media (min-width: 40rem) {
		.project-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 64rem) {
		.project-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.project-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
		border: 1px solid transparent;
		border-radius: var(--radius);
		background: var(--bg-raised);
		transition: border-color var(--duration) var(--ease-out);
	}
	.project-card:hover {
		border-color: var(--border);
	}
	.thumb {
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: var(--bg-sunken);
	}
	.thumb :global(img) {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: scale 400ms var(--ease-out);
	}
	.project-card:hover .thumb :global(img) {
		scale: 1.03;
	}
	.info {
		padding: 1rem 1.25rem 1.25rem;
	}
	.info h2 {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.35;
	}
	/* The title underlines like a link when the card is hovered. */
	.info h2 span {
		background: linear-gradient(var(--accent), var(--accent)) 0 100% / 0% 2px no-repeat;
		transition: background-size var(--duration) var(--ease-out);
	}
	.project-card:hover h2 span {
		background-size: 100% 2px;
	}
	.description {
		margin: 0.375rem 0 0;
		font-size: 1rem;
		color: var(--text-muted);
	}
	.stack {
		display: flex;
		flex-wrap: wrap;
		gap: 0.125rem 1rem;
		margin: 0.75rem 0 0;
		padding: 0;
		list-style: none;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		color: var(--text-muted);
	}
	.stack li {
		margin: 0;
	}
	@media (max-width: 39.99rem) {
		.project-card {
			flex-direction: row;
			align-items: flex-start;
		}
		.thumb {
			flex: 0 0 7.5rem;
			aspect-ratio: 4 / 3;
			margin: 0.875rem 0 0.875rem 0.875rem;
			border-radius: var(--radius-sm);
		}
		.info {
			padding: 0.75rem 1rem;
		}
	}

	/* Dialog: nearly full screen on desktop, full screen on phones. */
	.project-dialog {
		width: 96vw;
		height: 94dvh;
		max-width: none;
		max-height: none;
		padding: 0;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		color: var(--text);
	}
	.project-dialog::backdrop {
		background: color-mix(in srgb, var(--ctp-crust) 75%, transparent);
	}
	@media (max-width: 39.99rem) {
		.project-dialog {
			width: 100%;
			height: 100dvh;
			border: 0;
			border-radius: 0;
		}
	}
	:global(:root:has(.project-dialog[open])) {
		overflow: hidden;
	}
	.dialog-scroll {
		position: relative;
		height: 100%;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 3.75rem var(--gutter) 3rem;
	}
	.close {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		z-index: 1;
		background: var(--bg);
	}
	.dialog-scroll > :global(.carousel) {
		max-width: 72rem;
		margin-inline: auto;
	}
	.dialog-text {
		max-width: var(--measure);
		margin: 2rem auto 0;
	}
	.dialog-text h2 {
		margin: 0;
		font-size: 2rem;
		font-weight: 700;
	}
	.dialog-text .stack {
		margin-block-start: 0.5rem;
		font-size: 0.875rem;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.5rem;
		margin: 1rem 0 0;
		font-family: var(--font-mono);
		font-size: 0.9375rem;
	}
	.links a {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}
	.body {
		margin-block-start: 1.5rem;
	}
	.body > :global(:first-child) {
		margin-block-start: 0;
	}

	/* The card morphs into the dialog. Snapshots keep their aspect ratio (cropped, not stretched). */
	:global(::view-transition-group(project)) {
		animation-duration: 350ms;
		animation-timing-function: var(--ease-out);
	}
	:global(::view-transition-old(project)),
	:global(::view-transition-new(project)) {
		height: 100%;
		object-fit: cover;
		object-position: top;
	}
	/* Without View Transitions: the dialog fades and scales in and out. */
	@supports not (view-transition-name: none) {
		.project-dialog,
		.project-dialog::backdrop {
			opacity: 0;
			transition:
				opacity 200ms var(--ease-out),
				scale 200ms var(--ease-out),
				display 200ms allow-discrete,
				overlay 200ms allow-discrete;
		}
		.project-dialog {
			scale: 0.96;
		}
		.project-dialog[open],
		.project-dialog[open]::backdrop {
			opacity: 1;
			scale: none;
		}
		@starting-style {
			.project-dialog[open],
			.project-dialog[open]::backdrop {
				opacity: 0;
			}
			.project-dialog[open] {
				scale: 0.96;
			}
		}
	}

	/* No JavaScript: the targeted dialog shows as a full-screen overlay with a close link. */
	.project-grid:not(.enhanced) .project-dialog:target {
		display: block;
		position: fixed;
		inset: 0;
		z-index: 30;
		width: 100%;
		height: 100%;
		margin: 0;
		border: 0;
		border-radius: 0;
	}
</style>
