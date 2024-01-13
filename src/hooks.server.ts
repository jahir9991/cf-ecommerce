import { error, json, type Handle, type HandleServerError } from '@sveltejs/kit';
import { injectD1, injectR2 } from './db/D1.connect';
import { KitError } from './app/exceptions/KitError';
import { HttpStatus } from './app/exceptions/httpStatus.enum';
import { GraphQLServer } from './graphQL/graphQL.server';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/api')) {
		await injectD1(event);
		await injectR2(event);
	} else if (event.url.pathname.startsWith('/graphql')) {
		await injectD1(event);
		await injectR2(event);

		return GraphQLServer(event);
	}

	if (event.url.pathname.startsWith('/api') && event.request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Headers': '*'
			}
		});
	}

	const response = await resolve(event);

	if (event.url.pathname.startsWith('/api')) {
		response.headers.append('Access-Control-Allow-Origin', `*`);
	}

	return response;
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const errorId = crypto.randomUUID();

	console.log('errorId', error);

	return {
		message: 'something went wrong',
		// statusCode: status,
		errorId,
		// error
	};
};
