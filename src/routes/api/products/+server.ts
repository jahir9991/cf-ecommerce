import { UserService } from '@/services/product.service.js';
import { json } from '@sveltejs/kit';

const modelService = new UserService();

export async function GET({ url, locals }) {
	try {
		const options = {
			limit: Number(url.searchParams.get('limit') ?? 10),
			page: Number(url.searchParams.get('page') ?? 1),
			q: url.searchParams.get('q') ?? ''
		};
		const selectFields = JSON.parse(url.searchParams.get('fields') ?? '[]') ?? [];
		const withMeta = url.searchParams.get('withmeta') === 'false' ? false : true;

		const response = await modelService.getAll(locals.DB, options, selectFields, withMeta);
		return json(response);
	} catch (error) {
		return error;
	}
}
