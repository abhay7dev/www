<script>
	import IconArrowUpRight from '@tabler/icons-svelte-runes/icons/arrow-up-right';
	import IconBrandGithub from '@tabler/icons-svelte-runes/icons/brand-github';
	import IconBrandLinkedin from '@tabler/icons-svelte-runes/icons/brand-linkedin';
	import IconBrandX from '@tabler/icons-svelte-runes/icons/brand-x';
	import IconFileCv from '@tabler/icons-svelte-runes/icons/file-cv';
	import IconMail from '@tabler/icons-svelte-runes/icons/mail';
	import Head from '#lib/components/Head.svelte';
	import { contact } from '#lib/site.js';

	// Handles are derived from the URLs, so they cannot drift from them.
	const handle = (url) => new URL(url).pathname.split('/').filter(Boolean).at(-1);

	const links = [
		{
			href: contact.github,
			label: 'GitHub',
			detail: handle(contact.github),
			icon: IconBrandGithub
		},
		{
			href: contact.linkedin,
			label: 'LinkedIn',
			detail: handle(contact.linkedin),
			icon: IconBrandLinkedin
		},
		{ href: contact.x, label: 'X', detail: `@${handle(contact.x)}`, icon: IconBrandX },
		// Shown once supplied in site.js.
		contact.email && {
			href: contact.email,
			label: 'Email',
			detail: contact.email.replace(/^mailto:/, ''),
			icon: IconMail
		},
		contact.resume && { href: contact.resume, label: 'Résumé', detail: 'PDF', icon: IconFileCv }
	].filter(Boolean);
</script>

<Head title="Contact" description="Ways to reach Abhay Bhat." path="/contact" />

<h1>Contact</h1>

<!-- PLACEHOLDER: lorem ipsum until the user writes this line. -->
<p class="intro">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>

<ul class="links">
	{#each links as { href, label, detail, icon: Icon }, i (href)}
		<li style:--i={i}>
			<a {href} rel="me">
				<Icon size={22} stroke={1.75} aria-hidden="true" />
				<span class="label">{label}</span>
				<span class="detail">{detail}</span>
				<span class="arrow"><IconArrowUpRight size={18} stroke={1.75} aria-hidden="true" /></span>
			</a>
		</li>
	{/each}
</ul>

<style>
	.intro {
		color: var(--text-muted);
		margin-block-end: 2rem;
	}
	.links {
		display: grid;
		gap: 0.75rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		margin: 0;
	}
	a {
		display: grid;
		grid-template-columns: auto auto 1fr auto;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border: 1px solid transparent;
		border-radius: var(--radius);
		background: var(--bg-raised);
		transition: border-color var(--duration) var(--ease-out);
	}
	a:hover {
		border-color: var(--border);
	}
	.label {
		font-family: var(--font-mono);
		font-weight: 600;
	}
	.detail {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.arrow {
		display: grid;
		color: var(--text-muted);
		transition:
			translate var(--duration) var(--ease-out),
			color var(--duration) var(--ease-out);
	}
	a:hover .arrow {
		color: var(--text);
		translate: 2px -2px;
	}
</style>
