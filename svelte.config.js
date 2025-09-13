import adapter from '@sveltejs/adapter-node'; // or adapter-auto
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		prerender: {
			handleUnseenRoutes: 'warn' // or 'ignore' instead of throwing an error
		}
	}
};

export default config;