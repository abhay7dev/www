<script>
	import Head from '#lib/components/Head.svelte';
	import { formatMonth } from '#lib/blog/format.js';
	import { experience } from '../../../content/experience.js';
</script>

<Head
	title="Experience"
	description="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."
	path="/experience"
/>

<h1>Experience</h1>

<ol class="timeline">
	{#each experience as item, i (item.role + item.start)}
		<li class:current={!item.end} style:--i={i}>
			<p class="when">
				<time datetime={item.start}>{formatMonth(item.start)}</time>
				<span aria-hidden="true">–</span>
				{#if item.end}
					<time datetime={item.end}>{formatMonth(item.end)}</time>
				{:else}
					Present
				{/if}
			</p>
			<div class="what">
				<h2>{item.role}</h2>
				<p class="org">
					{#if item.link}<a href={item.link}>{item.org}</a>{:else}{item.org}{/if}
				</p>
				<p>{item.summary}</p>
			</div>
		</li>
	{/each}
</ol>

<style>
	/* Date column, a rule with a dot per entry (Lavender for the current one), then the role. */
	.timeline {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		position: relative;
		display: grid;
		grid-template-columns: 9.5rem 1fr;
		gap: 0 2rem;
		margin: 0;
		padding-block-end: 2.5rem;
	}
	li::before {
		content: '';
		position: absolute;
		top: 0.5rem;
		bottom: -0.5rem;
		left: calc(9.5rem + 1rem);
		width: 1px;
		background: var(--border);
	}
	li:last-child::before {
		display: none;
	}
	li::after {
		content: '';
		position: absolute;
		top: 0.4rem;
		left: calc(9.5rem + 1rem - 4px);
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--bg);
		border: 1.5px solid var(--ctp-surface2);
	}
	li.current::after {
		background: var(--accent);
		border-color: var(--accent);
	}
	.when {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.875rem;
		color: var(--text-muted);
		line-height: 1.6;
	}
	.what {
		padding-inline-start: 1rem;
	}
	h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}
	.org {
		margin: 0.25rem 0 0.75rem;
		color: var(--text-muted);
	}
	.what > :last-child {
		margin-block-end: 0;
	}
	/* Phones: the rule moves to the left edge and the dates sit above each role. */
	@media (max-width: 40rem) {
		li {
			grid-template-columns: 1fr;
			padding-inline-start: 1.5rem;
		}
		li::before {
			left: 0.25rem;
		}
		li::after {
			left: calc(0.25rem - 4px);
		}
		.what {
			padding-inline-start: 0;
		}
	}
</style>
