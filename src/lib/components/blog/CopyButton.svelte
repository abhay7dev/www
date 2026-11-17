<script>
	// Mounted into each code block's header by enhanceCode (so it never exists without JS).
	import IconCheck from '@tabler/icons-svelte-runes/icons/check';
	import IconCopy from '@tabler/icons-svelte-runes/icons/copy';

	let { code } = $props(); // the <code> element; line numbers are CSS, so never copied
	let copied = $state(false);
	let timer;

	async function copy() {
		try {
			await navigator.clipboard.writeText(code.innerText.replace(/\n$/, ''));
		} catch {
			return; // clipboard blocked: leave the icon as it was
		}
		copied = true;
		clearTimeout(timer);
		timer = setTimeout(() => (copied = false), 1500);
	}
</script>

<button
	class="icon-button copy-button"
	type="button"
	onclick={copy}
	aria-label={copied ? 'Copied' : 'Copy code'}
>
	{#key copied}
		<span class="swap">
			{#if copied}
				<IconCheck size={16} stroke={1.75} aria-hidden="true" />
			{:else}
				<IconCopy size={16} stroke={1.75} aria-hidden="true" />
			{/if}
		</span>
	{/key}
</button>

<style>
	.copy-button {
		width: 2rem;
		height: 2rem;
		margin-inline-start: auto;
	}
	.swap {
		display: grid;
		animation: pop 250ms var(--ease-out);
	}
	@keyframes pop {
		from {
			opacity: 0;
			scale: 0.5;
		}
	}
</style>
