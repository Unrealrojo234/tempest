<script>
	import pb from '$lib';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let loading = $state(true);

	const id = $page.params.id;

	let htmlContent = $state('');

	async function fetchContent() {
		try {
			const record = await pb.collection('resources').getOne(id);
			htmlContent = record.content;
		} catch (error) {
			console.log('error', error.message);
		}
	}

	fetchContent();
</script>

<main>
	{@html htmlContent}
</main>
