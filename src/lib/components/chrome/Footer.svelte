<script>
	import IconCode from '@tabler/icons-svelte-runes/icons/code';
	import IconRss from '@tabler/icons-svelte-runes/icons/rss';
	import { site } from '#lib/site.js';
</script>

<footer class="site-footer">
	<span>© 2026 {site.name}</span>
	<a href="/licenses">Licenses</a>
	<a class="icon-link" href="/rss.xml">
		<IconRss size={18} stroke={1.75} aria-hidden="true" /><span class="label">RSS</span>
	</a>
	<a class="icon-link" href={site.repo}>
		<IconCode size={18} stroke={1.75} aria-hidden="true" /><span class="label">Source</span>
	</a>
</footer>

<style>
	.site-footer {
		display: flex;
		align-items: center;
		flex-wrap: nowrap;
		gap: 1.5rem;
		width: 100%;
		max-width: var(--wide);
		margin-inline: auto;
		padding: 3rem var(--gutter) 2rem;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--text-muted);
		white-space: nowrap;
	}
	a {
		background: none;
		transition: color var(--duration) var(--ease-out);
	}
	a:hover {
		color: var(--text);
	}
	.icon-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}
	.icon-link :global(svg) {
		transition: translate var(--duration) var(--ease-out);
	}
	.icon-link:hover :global(svg) {
		translate: 0 -2px;
	}
	/* Phones: RSS and Source become icon-only (the text stays for screen readers). */
	@media (max-width: 30rem) {
		.site-footer {
			gap: 1rem;
		}
		.label {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}
	}
</style>
