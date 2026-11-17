<script>
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { nav, site } from '#lib/site.js';
	import ThemeToggle from './ThemeToggle.svelte';

	let header;
	let menu;
	let list;
	let hidden = $state(false);
	let scrolled = $state(false);
	let indicator = $state(null); // { x, width } of the current page's link
	let indicatorReady = $state(false);

	const isCurrent = (href) =>
		page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

	// The Lavender bar sits under the current page's link and slides when it changes.
	function measure() {
		const link = list?.querySelector('[aria-current="page"]');
		indicator = link ? { x: link.offsetLeft, width: link.offsetWidth } : null;
	}

	$effect(() => {
		page.url.pathname;
		measure();
	});

	afterNavigate(() => {
		if (menu) menu.open = false;
		hidden = false;
	});

	onMount(() => {
		// Hide on scroll down, show on scroll up; small jitters are ignored.
		let last = scrollY;
		const onScroll = () => {
			const y = scrollY;
			scrolled = y > 0;
			if (Math.abs(y - last) < 4) return;
			hidden = y > last && y > header.offsetHeight && !menu.open;
			last = y;
		};
		const onKey = (event) => {
			if (event.key !== 'Escape' || !menu.open) return;
			menu.open = false;
			menu.querySelector('summary').focus();
		};
		const onPointer = (event) => {
			if (menu.open && !menu.contains(event.target)) menu.open = false;
		};
		const resize = new ResizeObserver(measure); // web fonts change link widths
		resize.observe(list);
		addEventListener('scroll', onScroll, { passive: true });
		document.addEventListener('keydown', onKey);
		document.addEventListener('pointerdown', onPointer);
		requestAnimationFrame(() => (indicatorReady = true)); // no slide in from the left on load
		return () => {
			resize.disconnect();
			removeEventListener('scroll', onScroll);
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('pointerdown', onPointer);
		};
	});
</script>

<header
	class="site-header"
	class:hidden
	class:scrolled
	class:home={page.url.pathname === '/'}
	bind:this={header}
>
	<div class="bar">
		<a class="brand" href="/">{site.name}</a>

		<nav class="nav-wide" aria-label="Primary">
			<ul bind:this={list}>
				{#each nav as item (item.href)}
					<li>
						<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}
							>{item.label}</a
						>
					</li>
				{/each}
			</ul>
			{#if indicator}
				<span
					class="indicator"
					class:ready={indicatorReady}
					style:translate="{indicator.x}px 0"
					style:width="{indicator.width}px"
				></span>
			{/if}
		</nav>

		<ThemeToggle />

		<details class="menu" bind:this={menu}>
			<summary class="icon-button" aria-label="Menu">
				<span class="burger" aria-hidden="true"><span></span><span></span><span></span></span>
			</summary>
			<nav class="menu-panel" aria-label="Primary">
				<ul>
					{#each nav as item, i (item.href)}
						<li style:--i={i}>
							<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}
								>{item.label}</a
							>
						</li>
					{/each}
				</ul>
			</nav>
		</details>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		top: 0;
		z-index: 10;
		padding-inline: var(--gutter);
		background: var(--bg);
		border-block-end: 1px solid transparent;
		transition:
			translate 150ms var(--ease-out),
			border-color var(--duration) var(--ease-out),
			background-color var(--duration) var(--ease-out);
	}
	.scrolled {
		border-block-end-color: var(--border);
	}
	/* Keyboard users and an open menu always see the header. */
	.hidden:not(:focus-within) {
		translate: 0 -100%;
	}
	.home {
		background: transparent;
	}

	.bar {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		height: var(--header-height);
		max-width: var(--wide);
		margin-inline: auto;
	}

	.brand {
		margin-inline-end: auto;
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 1.125rem;
		letter-spacing: -0.015em;
		background: none;
	}

	a {
		background: none;
	}

	.nav-wide {
		position: relative;
	}
	.nav-wide ul {
		display: flex;
		gap: 1.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.nav-wide li + li {
		margin: 0;
	}
	.nav-wide a {
		display: block;
		padding-block: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.9375rem;
		color: var(--text-muted);
		transition: color var(--duration) var(--ease-out);
	}
	.nav-wide a:hover,
	.nav-wide a[aria-current='page'] {
		color: var(--text);
	}
	.indicator {
		position: absolute;
		left: 0;
		bottom: 0.125rem;
		height: 2px;
		border-radius: 1px;
		background: var(--accent);
	}
	.indicator.ready {
		transition:
			translate 300ms var(--ease-out),
			width 300ms var(--ease-out);
	}

	.menu {
		display: none;
	}
	@media (max-width: 44rem) {
		.bar {
			gap: 0.25rem;
		}
		.nav-wide {
			display: none;
		}
		.menu {
			display: block;
		}
	}

	summary {
		list-style: none;
		cursor: pointer;
	}
	summary::-webkit-details-marker {
		display: none;
	}

	/* Three bars that fold into an X when the menu opens. */
	.burger {
		position: relative;
		width: 1.125rem;
		height: 0.75rem;
	}
	.burger span {
		position: absolute;
		left: 0;
		width: 100%;
		height: 1.5px;
		border-radius: 1px;
		background: currentColor;
		transition:
			translate var(--duration) var(--ease-out),
			rotate var(--duration) var(--ease-out),
			opacity var(--duration) var(--ease-out);
	}
	.burger span:nth-child(1) {
		top: 0;
	}
	.burger span:nth-child(2) {
		top: calc(50% - 0.75px);
	}
	.burger span:nth-child(3) {
		bottom: 0;
	}
	[open] .burger span:nth-child(1) {
		translate: 0 calc(0.375rem - 0.75px);
		rotate: 45deg;
	}
	[open] .burger span:nth-child(2) {
		opacity: 0;
	}
	[open] .burger span:nth-child(3) {
		translate: 0 calc(-0.375rem + 0.75px);
		rotate: -45deg;
	}

	.menu-panel {
		position: absolute;
		inset-inline: 0;
		top: 100%;
		padding: 0.5rem var(--gutter) 1.5rem;
		background: var(--bg);
		border-block-end: 1px solid var(--border);
		animation: panel 250ms var(--ease-out);
	}
	.menu-panel ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.menu-panel li {
		margin: 0;
		animation: rise 300ms var(--ease-out) backwards;
		animation-delay: calc(60ms + var(--i) * 40ms);
	}
	.menu-panel a {
		display: block;
		padding-block: 0.625rem;
		font-family: var(--font-mono);
		font-size: 1.5rem;
		color: var(--text-muted);
	}
	.menu-panel a[aria-current='page'] {
		color: var(--text);
	}
	@keyframes panel {
		from {
			clip-path: inset(0 0 100% 0);
		}
		to {
			clip-path: inset(0);
		}
	}
</style>
