<script>
	import '../app.css';
	import regularLatin from '../fonts/FiraSans-Regular-latin.woff2?url';
	import { page } from '$app/state';
	import { nav } from '#lib/site.js';

	let { children } = $props();

	const current = (href) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<link rel="preload" href={regularLatin} as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<header>
	<nav aria-label="Primary">
		<ul>
			{#each nav as item (item.href)}
				<li>
					<a href={item.href} aria-current={current(item.href) ? 'page' : undefined}>{item.label}</a
					>
				</li>
			{/each}
		</ul>
	</nav>
</header>

<main id="main">
	{@render children()}
</main>

<footer>
	<p><a href="/licenses">Licenses and open-source notices</a></p>
</footer>
