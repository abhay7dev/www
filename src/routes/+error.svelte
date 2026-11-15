<script>
	import { page } from '$app/state';
	import Head from '#lib/components/Head.svelte';
	import NotFound from '#lib/components/NotFound.svelte';
</script>

{#if page.status === 404}
	<Head
		title="Page not found"
		description="This page does not exist."
		path={page.url.pathname}
		noindex
	/>
	<NotFound blog={page.url.pathname.startsWith('/blog')} />
{:else}
	<Head title="Error" description="Something went wrong." path={page.url.pathname} noindex />
	<h1>Something went wrong</h1>
	<p>{page.error?.message}</p>
	<p><a href="/">Back to the homepage</a></p>
{/if}
