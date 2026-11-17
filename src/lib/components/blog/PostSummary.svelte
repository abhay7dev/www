<script>
	import { formatDate } from '#lib/blog/format.js';
	import Title from './Title.svelte';

	let { post } = $props();
</script>

<div class="entry-head">
	<a href={post.url}><Title text={post.title} /></a>
	<time datetime={post.date}>{formatDate(post.date)}</time>
</div>
<p>{post.description}</p>
