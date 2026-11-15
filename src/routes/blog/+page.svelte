<script>
	import Head from '#lib/components/Head.svelte';
	import PostSummary from '#lib/components/blog/PostSummary.svelte';
	import { formatDate } from '#lib/blog/format.js';

	let { data } = $props();
</script>

<Head title="Blog" description="Posts by Abhay Bhat." path="/blog" />

<h1>Blog</h1>

<ul class="blog-listing">
	{#each data.listing as entry (entry.url)}
		<li>
			{#if entry.kind === 'post'}
				<PostSummary post={entry} />
			{:else}
				<details>
					<summary>
						<a href={entry.url}>{entry.title}</a>
						<time datetime={entry.date}>{formatDate(entry.date)}</time>
					</summary>
					<p>{entry.description}</p>
					<ul>
						{#each entry.posts as post (post.url)}
							<li><PostSummary {post} /></li>
						{/each}
					</ul>
				</details>
			{/if}
		</li>
	{:else}
		<li>No posts yet.</li>
	{/each}
</ul>
