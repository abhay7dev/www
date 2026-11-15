<script>
	import TocList from './TocList.svelte';

	let { items } = $props();
</script>

<!-- Two copies, one per breakpoint; CSS hides the inactive one (display: none also hides it from assistive tech). -->
<details class="toc-inline">
	<summary>Contents</summary>
	<TocList {items} />
</details>
<nav class="toc-side" aria-label="Table of contents">
	<TocList {items} />
</nav>
