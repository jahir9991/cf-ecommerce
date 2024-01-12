import type { ProductSelect } from '@/db/schemas/Product.entity.js';
import { ProductService } from '@/services/product.service.js';
import { json } from '@sveltejs/kit';

const modelService = new ProductService();

export async function GET({ url, params, locals }) {
	try {
		if (!locals.DB) throw new Error('no db found');
		const DB = locals.DB;
		const selectFields = JSON.parse(url.searchParams.get('fields') ?? '[]') ?? [];
		const id = params.id;

		const response = await modelService.getOne(DB, id, selectFields);

		return json(response);
	} catch (error: any) {
		console.log('err', error);
		return json({ error: error.message }, { status: 400 });
	}
}

export const PUT = async ({ locals, request, params: { id } }) => {
	try {
		if (!locals.DB) throw new Error('no db found');
		const DB = locals.DB;
		const R2 = locals.R2;

		let formData: any = Object.fromEntries(await request.formData());

		console.log('payload', formData);

		const response = await modelService.updateOne(DB, R2, id, formData);

		return json(response);
	} catch (error: any) {
		console.log('err', error);
		return json({ error: error.message }, { status: 400 });
	}
};

export const DELETE = async ({ locals, params: { id } }) => {
	try {
		if (!locals.DB) throw new Error('no db found');
		const DB = locals.DB;

		const response = await modelService.deleteOne(DB, id);

		return json(response);
	} catch (error: any) {
		console.log('err', error);
		return json({ error: error.message }, { status: 400 });
	}
};
