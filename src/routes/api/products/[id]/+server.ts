import { KitError } from '@/app/exceptions/KitError.js';
import { UpdateProductDto } from '@/dto/product.dto.js';
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
		// validation.....
		let productData: any;

		try {
			productData = UpdateProductDto.parse(formData);
		} catch (err) {
			let h = KitError(400, {
				message: 'invalid payload...',
				validations: err
			});
			console.log('h>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', err);
			throw h;
		}

		const response = await modelService.updateOne(DB, R2, id, productData);

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
