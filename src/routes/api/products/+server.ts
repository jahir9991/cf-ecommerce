import { KitError } from '@/app/exceptions/KitError.js';
import { HttpStatus } from '@/app/exceptions/httpStatus.enum.js';
import {} from '@/db/schemas/Product.entity.js';
import { insertProductDto } from '@/dto/product.dto.js';
import { SERVER_ENV } from '@/environments/ENV.server.js';
import { ProductService } from '@/services/product.service.js';
import { StorageService } from '@/services/storage.service.js';
import { error, json } from '@sveltejs/kit';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { ZodError, z } from 'zod';

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
	} catch (err) {
		throw error;
	}
}

export async function POST({ request, locals, platform, url }) {
	try {
		if (!locals.DB)
			throw KitError(400, {
				message: 'no db found'
			});
		if (!locals.R2)
			throw KitError(400, {
				message: 'no R2 found...'
			});

		const DB = locals.DB;
		const R2 = locals.R2;
		console.log('r2', R2);

		let formData: any = Object.fromEntries(await request.formData());
		const selectFields = JSON.parse(url.searchParams.get('fields') ?? '[]') ?? [];

		let productData: any;

		try {
			productData = insertProductDto.parse(formData);
		} catch (err) {
			console.log('h>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', err);

			throw {
				message: 'invalid payload...',
				validations: err
			};
		}

		console.log('productData', productData);
		const response = await modelService.createOne(DB, R2, productData, selectFields);

		return json(response);
	} catch (err) {
		console.log('i am here', isZodError(err));

		throw err;
	}
}

const isKitError = (value: any): value is KitError => {
	return value instanceof KitError;
};

const isZodError = (value: any): value is ZodError => {
	return value instanceof ZodError;
};
