<script>
	import { site } from '#lib/site.js';

	let {
		title,
		description,
		path,
		type = 'website',
		image = '/og/site.png',
		published = null,
		modified = null,
		noindex = false
	} = $props();

	const fullTitle = $derived(title === site.name ? title : `${title} · ${site.name}`);
	const url = $derived(new URL(path, site.origin).href);
	const imageUrl = $derived(new URL(image, site.origin).href);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	{#if noindex}
		<meta name="robots" content="noindex" />
	{:else}
		<link rel="canonical" href={url} />
	{/if}
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:type" content={type} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
	{#if published}
		<meta property="article:published_time" content={published} />
	{/if}
	{#if modified}
		<meta property="article:modified_time" content={modified} />
	{/if}
</svelte:head>
