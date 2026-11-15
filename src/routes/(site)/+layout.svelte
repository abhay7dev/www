<script>
	// Non-blog pages. The background simulation, once chosen, mounts here so it persists across
	// navigation between these pages and never loads under /blog.
	let { children } = $props();
</script>

{@render children()}
