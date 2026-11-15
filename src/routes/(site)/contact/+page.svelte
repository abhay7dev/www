<script>
	import Head from '#lib/components/Head.svelte';
	import { contact } from '#lib/site.js';
</script>

<Head title="Contact" description="Ways to reach Abhay Bhat." path="/contact" />

<h1>Contact</h1>

<ul>
	<li><a href={contact.github} rel="me">GitHub</a></li>
	<li><a href={contact.linkedin} rel="me">LinkedIn</a></li>
	<li><a href={contact.x} rel="me">X</a></li>
	{#if contact.email}
		<li><a href={contact.email}>Email</a></li>
	{/if}
	{#if contact.resume}
		<li><a href={contact.resume}>Résumé</a></li>
	{/if}
</ul>
