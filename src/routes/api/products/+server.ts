/* eslint-disable @typescript-eslint/no-explicit-any */
import { insertProductDto } from '@/db/schemas/Product.entity.js';
import { SERVER_ENV } from '@/environments/ENV.server.js';
import { ProductService } from '@/services/product.service.js';
import { StorageService } from '@/services/storage.service.js';
import { json } from '@sveltejs/kit';

const modelService = new ProductService();

export async function GET({ url, locals, platform }) {
	try {
		if (!locals.DB) throw new Error('no db found');
		const DB = locals.DB;
		const options = {
			limit: Number(url.searchParams.get('limit') ?? 10),
			page: Number(url.searchParams.get('page') ?? 1),
			q: url.searchParams.get('q') ?? ''
		};
		const selectFields = JSON.parse(url.searchParams.get('fields') ?? '[]') ?? [];
		const withMeta = url.searchParams.get('withmeta') === 'false' ? false : true;

		const response = await modelService.getAll(DB, options, selectFields, withMeta);
		return json(response);
	} catch (error) {
		return error;
	}
}

export async function POST({ request, locals, platform }) {
	try {
		if (!locals.DB) throw new Error('no db found');
		const DB = locals.DB;
		const R2 = locals.R2;

		let formData: any = Object.fromEntries(await request.formData());

		// const payload: any = {
		// 	name: formData.name,
		// 	description: formData.description,
		// 	price: formData.price,
		// 	quantity: formData.quantity
		// };

		const productData: any = insertProductDto.parse(formData);

		console.log('productData', productData);
		const response = await modelService.createOne(DB, R2, productData);

		return json(response);
	} catch (error) {
		return json({ error });
	}
}
