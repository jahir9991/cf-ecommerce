import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ fetch }) => {
	console.log('load server running...');

	const response = await fetch('/api/products');
	const res = await response.json();

	return res;
};
