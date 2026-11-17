<script>
	import { onMount } from 'svelte';
	import IconChevronDown from '@tabler/icons-svelte-runes/icons/chevron-down';
	import Head from '#lib/components/Head.svelte';
	import PostSummary from '#lib/components/blog/PostSummary.svelte';
	import { formatDate } from '#lib/blog/format.js';
	import Title from '#lib/components/blog/Title.svelte';

	let { data } = $props();
	let list;

	const EASE_OUT = 'cubic-bezier(0.2, 0, 0, 1)';

	/** Opens or closes a group, animating the height of its posts. */
	function setOpen(details, open) {
		const body = details.querySelector('.group-body');
		body.getAnimations().forEach((animation) => animation.cancel());
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			details.open = open;
			return;
		}
		if (open) details.open = true;
		details.classList.toggle('closing', !open); // flips the chevron as the close starts
		const height = `${body.offsetHeight}px`;
		body.style.overflow = 'hidden';
		const animation = body.animate(
			open
				? [
						{ height: '0px', opacity: 0 },
						{ height, opacity: 1 }
					]
				: [
						{ height, opacity: 1 },
						{ height: '0px', opacity: 0 }
					],
			{ duration: open ? 320 : 220, easing: EASE_OUT }
		);
		animation.onfinish = () => {
			body.style.overflow = '';
			details.classList.remove('closing');
			if (!open) details.open = false;
		};
	}

	// Clicking the group row (but not its title link) toggles it, animated.
	function onSummaryClick(event) {
		if (event.target.closest('a')) return;
		event.preventDefault();
		const details = event.currentTarget.parentElement;
		setOpen(details, !details.open);
	}

	// Groups are prerendered open (readable without JS). Groups below the screen close now and
	// open as they scroll into view; once open they stay open.
	onMount(() => {
		const groups = [...list.querySelectorAll('details.group')];
		const observer = new IntersectionObserver(
			(entries) => {
				for (const { isIntersecting, target } of entries) {
					if (!isIntersecting) continue;
					observer.unobserve(target);
					if (!target.open) setOpen(target, true);
				}
			},
			{ threshold: 0.4 }
		);
		for (const group of groups) {
			if (group.getBoundingClientRect().top < innerHeight) continue;
			group.open = false;
			observer.observe(group);
		}
		return () => observer.disconnect();
	});
</script>

<Head title="Blog" description="Posts by Abhay Bhat." path="/blog" />

<h1>Blog</h1>

<ul class="post-list" bind:this={list}>
	{#each data.listing as entry, i (entry.url)}
		{#if entry.kind === 'post'}
			<li class="card" style:--i={i}><PostSummary post={entry} /></li>
		{:else}
			<li class="card group-card" style:--i={i}>
				<details class="group" open>
					<summary onclick={onSummaryClick}>
						<span class="entry-head">
							<a href={entry.url}><Title text={entry.title} /></a>
							<time datetime={entry.date}>{formatDate(entry.date)}</time>
						</span>
						<span class="description">{entry.description}</span>
						<span class="group-toggle" aria-hidden="true">
							<IconChevronDown size={18} stroke={1.75} />
						</span>
					</summary>
					<ul class="group-body">
						{#each entry.posts as post (post.url)}
							<li class="row"><PostSummary {post} /></li>
						{/each}
					</ul>
				</details>
			</li>
		{/if}
	{:else}
		<li>No posts yet.</li>
	{/each}
</ul>
