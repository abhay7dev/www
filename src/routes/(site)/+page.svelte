<script>
	import IconBrandGithub from '@tabler/icons-svelte-runes/icons/brand-github';
	import IconBrandLinkedin from '@tabler/icons-svelte-runes/icons/brand-linkedin';
	import IconBrandX from '@tabler/icons-svelte-runes/icons/brand-x';
	import Head from '#lib/components/Head.svelte';
	import { contact, site } from '#lib/site.js';

	const socials = [
		{ href: contact.github, label: 'GitHub', icon: IconBrandGithub },
		{ href: contact.linkedin, label: 'LinkedIn', icon: IconBrandLinkedin },
		{ href: contact.x, label: 'X', icon: IconBrandX }
	];
</script>

<Head title={site.name} description={site.description} path="/" />

<section class="hero">
	<!-- --chars drives the typewriter: one step per character (Fira Code is monospaced). -->
	<h1 style:--chars={site.name.length}>{site.name}</h1>
	<p>{site.tagline}</p>
	<ul>
		{#each socials as { href, label, icon: Icon } (href)}
			<li>
				<a class="icon-button" {href} aria-label={label}>
					<Icon size={22} stroke={1.75} aria-hidden="true" />
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.hero {
		display: grid;
		align-content: center;
		justify-items: start;
		min-height: calc(100dvh - var(--header-height) - 8rem);
	}
	h1 {
		margin: 0;
		font-size: clamp(2.5rem, 9vw, 4.5rem);
		letter-spacing: 0; /* the typewriter width is counted in ch */
	}
	p {
		max-width: 40ch;
		margin: 1rem 0 1.5rem;
		font-size: 1.25rem;
		color: var(--text-muted);
	}
	ul {
		display: flex;
		gap: 0.25rem;
		margin: 0 0 0 -0.5rem;
		padding: 0;
		list-style: none;
	}
	li + li {
		margin: 0;
	}
	.icon-button :global(svg) {
		transition: translate var(--duration) var(--ease-out);
	}
	.icon-button:hover :global(svg) {
		translate: 0 -2px;
	}

	/* First full load only: the name types in, the caret blinks and fades, then the rest
	   follows. SPA returns to the homepage use the normal route transition instead. */
	:global(:root:not(.navigated)) h1 {
		width: calc(var(--chars) * 1ch + 0.1em);
		overflow: hidden;
		white-space: nowrap;
		border-inline-end: 0.08em solid transparent;
		animation:
			type 0.7s steps(var(--chars)) 0.15s backwards,
			caret 0.9s step-end 0s 1,
			caret-fade 0.3s var(--ease-out) 0.9s forwards;
	}
	:global(:root:not(.navigated)) p,
	:global(:root:not(.navigated)) ul {
		animation: rise 400ms var(--ease-out) backwards;
	}
	:global(:root:not(.navigated)) p {
		animation-delay: 0.85s;
	}
	:global(:root:not(.navigated)) ul {
		animation-delay: 0.95s;
	}
	@keyframes type {
		from {
			width: 0;
		}
	}
	@keyframes caret {
		0%,
		33%,
		66% {
			border-color: var(--accent);
		}
		16%,
		50%,
		83% {
			border-color: transparent;
		}
	}
	@keyframes caret-fade {
		from {
			border-color: var(--accent);
		}
		to {
			border-color: transparent;
		}
	}
</style>
