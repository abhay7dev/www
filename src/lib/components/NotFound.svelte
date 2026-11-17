<script>
	import IconArrowLeft from '@tabler/icons-svelte-runes/icons/arrow-left';

	let { blog = false } = $props();
</script>

<section class="not-found">
	<p class="code" aria-hidden="true">404</p>
	<h1>Page not found</h1>
	<p>There is nothing at this address. It may have moved, or the link may be mistyped.</p>
	<a class="back-link" href={blog ? '/blog' : '/'}>
		<IconArrowLeft size={16} stroke={1.75} aria-hidden="true" />
		{blog ? 'Back to the blog' : 'Back to the homepage'}
	</a>
</section>

<style>
	.not-found {
		display: grid;
		align-content: center;
		justify-items: start;
		min-height: calc(100dvh - var(--header-height) - 12rem);
	}
	.code {
		margin: 0;
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: clamp(4rem, 16vw, 7rem);
		line-height: 1;
		color: var(--text-faint);
	}
	h1 {
		margin-block: 1rem 0.5rem;
	}
	p:not(.code) {
		color: var(--text-muted);
		margin-block-end: 1.5rem;
	}
</style>
