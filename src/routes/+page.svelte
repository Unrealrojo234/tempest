<script>
	import Drawer from './components/drawer.svelte';
	import Login from './components/login.svelte';
	import pb from '$lib';

	let showDrawer = $state(false);

	setInterval(async () => {
		showDrawer = pb.authStore.isValid;
	}, 1500);
</script>

<main>
	{#if showDrawer}
		<Drawer />
	{:else}
		<Login />
	{/if}
</main>

<style>
</style>
