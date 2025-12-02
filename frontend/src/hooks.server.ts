import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const start = Date.now();
	const { method, url } = event.request;

	console.log(`--> ${method} ${url.pathname}`);

	const response = await resolve(event);

	const duration = Date.now() - start;
	console.log(`<-- ${method} ${url.pathname} ${response.status} (${duration}ms)`);

	return response;
};
