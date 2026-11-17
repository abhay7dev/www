<script>
	import { onMount } from 'svelte';
	import IconMoon from '@tabler/icons-svelte-runes/icons/moon';
	import IconSun from '@tabler/icons-svelte-runes/icons/sun';
	import { currentTheme, onThemeChange, setTheme } from '#lib/theme/theme.js';

	// null until mounted: without JavaScript there is no button that cannot work.
	let theme = $state(null);

	onMount(() => {
		theme = currentTheme();
		return onThemeChange((next) => (theme = next));
	});

	/** Switches theme; the new one spreads in a circle from the button where supported. */
	function toggle(event) {
		const next = theme === 'dark' ? 'light' : 'dark';
		if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			setTheme(next);
			return;
		}
		const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
		const x = left + width / 2;
		const y = top + height / 2;
		const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
		const root = document.documentElement;
		root.classList.add('theme-transition');
		const transition = document.startViewTransition(() => setTheme(next));
		transition.ready.then(() =>
			root.animate(
				{ clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
				{
					duration: 500,
					easing: 'cubic-bezier(0.2, 0, 0, 1)',
					pseudoElement: '::view-transition-new(root)'
				}
			)
		);
		transition.finished.finally(() => root.classList.remove('theme-transition'));
	}
</script>

<span class="slot">
	{#if theme}
		<button
			class="icon-button"
			type="button"
			onclick={toggle}
			aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
		>
			{#key theme}
				<span class="swap">
					{#if theme === 'dark'}
						<IconSun size={20} stroke={1.75} aria-hidden="true" />
					{:else}
						<IconMoon size={20} stroke={1.75} aria-hidden="true" />
					{/if}
				</span>
			{/key}
		</button>
	{/if}
</span>

<style>
	/* Reserves the button's space so nothing shifts when it appears after hydration. */
	.slot {
		display: inline-grid;
		width: 2.5rem;
		height: 2.5rem;
	}
	.swap {
		display: grid;
		animation: swap 350ms var(--ease-out);
	}
	@keyframes swap {
		from {
			opacity: 0;
			rotate: -90deg;
			scale: 0.6;
		}
	}
</style>
