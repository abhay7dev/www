<script>
	let { blog = false } = $props();
</script>

<h1>Page not found</h1>
<p>There is nothing at this address.</p>
<p>
	{#if blog}
		<a href="/blog">Back to the blog</a>
	{:else}
		<a href="/">Back to the homepage</a>
	{/if}
</p>
