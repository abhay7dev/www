<script>
	import { formatDate } from '#lib/blog/format.js';

	let { post } = $props();
</script>

<a href={post.url}>{post.title}</a>
<time datetime={post.date}>{formatDate(post.date)}</time>
<p>{post.description}</p>
