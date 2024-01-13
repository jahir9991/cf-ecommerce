import { MyHTTPException } from '@/app/exceptions/MyHttpExceptions';
import type { SuccessResponse } from '@/app/responses/success.response';
import { getDbSelectkey } from '@/app/utils/getSelectKey.util';
import { Product } from '@/db/schemas';
import { DrizzleError, eq, like, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { StorageService } from './storage.service';
import { error } from '@sveltejs/kit';

const storageService = new StorageService();
export class ProductService {
	model = Product;

	getAll = async (
		DB: DrizzleD1Database,
		options: { q?: string; limit?: number; page?: number },
		selectFields?: string[],
		withMeta: boolean = true
	): Promise<SuccessResponse> => {
		try {
			const searchTerm = options.q ?? '';
			const limit: number = Number(options.limit ?? 10);
			const page: number = Number(options.page ?? 1);

			const payloadQ = DB.select(getDbSelectkey(selectFields, this.model))
				.from(this.model)
				.where(like(this.model.name, `%${searchTerm}%`))
				.limit(limit)
				.offset((page - 1) * limit);

			const countQ = DB.select({ count: sql<number>`count(*)` })
				.from(this.model)
				.where(like(this.model.name, `%${searchTerm}%`));

			const batchResponse = await DB.batch([payloadQ, ...(withMeta ? [countQ] : [])]);

			let meta;

			if (withMeta) {
				const [{ count: total }] = batchResponse[1];

				meta = {
					total,
					page,
					limit
				};
			}

			const rt = {
				success: true,
				message: 'success',
				...(meta && { meta }),
				payload: batchResponse[0]
			};

			return rt;
		} catch (error) {
			throw new MyHTTPException(400, {
				message: 'something went Wrong',
				devMessage: error.message,
				error: error.stack
			});
		}
	};
	getOne = async (
		DB: DrizzleD1Database,
		id: string,
		selectFields?: string[]
	): Promise<SuccessResponse> => {
		try {
			console.log('getOne', id);

			const result = await DB.select(getDbSelectkey(selectFields, this.model))
				.from(this.model)
				.where(eq(this.model.id, id))
				.get();
			console.log('result', result);

			return {
				message: result ? 'success' : 'no data found',
				success: true,
				payload: result ?? null
			};
		} catch (error) {
			throw new MyHTTPException(400, {
				message: 'something went Wrong',
				devMessage: 'this is dev message',
				error
			});
		}
	};

	createOne = async (
		DB: DrizzleD1Database,
		R2: R2Bucket,
		payload,
		selectFields?: string[]
	): Promise<SuccessResponse> => {
		try {
			if (payload.image satisfies File) {
				try {
					const { key, url } = await storageService.create({
						R2,
						file: payload.image,
						fileName: payload.image.name,
						folder: 'products'
					});

					payload.image = key;
					payload.imageUrl = url;
				} catch (error) {
					console.error(error);
				}
			}

			const result = await DB.insert(this.model)
				.values(payload)
				.returning(getDbSelectkey(selectFields, this.model));

			return {
				success: true,
				message: 'success',
				payload: result[0] ?? {}
			};
		} catch (e: any) {
			let error = {};

			if (e instanceof DrizzleError) {
				error = e.cause;
			}

			throw new MyHTTPException(400, {
				message: e.message ?? 'something went Wrong',
				devMessage: e.message ?? 'this is dev message',
				error: e
			});
		}
	};

	updateOne = async (DB: DrizzleD1Database, R2: R2Bucket, id, payload, selectFields?: string[]) => {
		try {
			if (payload.image as File satisfies File) {
				try {
					const { key, url } = await storageService.create({
						R2,
						file: payload.image,
						fileName: payload.image.name,
						folder: 'products'
					});

					payload.image = key;
					payload.imageUrl = url;
				} catch (error) {
					console.error(error);
				}
			}

			payload.updatedAt = new Date().toISOString();

			const result = await DB.update(this.model)
				.set(payload as any)
				.where(eq(this.model.id, id))
				.returning(getDbSelectkey(selectFields, this.model))
				.get();

			return { success: true, payload: result };
		} catch (error: any) {
			throw new MyHTTPException(400, {
				message: 'something went Wrong',
				devMessage: 'this is dev message',
				error
			});
		}
	};

	deleteOne = async (
		DB: DrizzleD1Database,
		R2: R2Bucket,
		id: string,
		selectFields?: string[]
	): Promise<SuccessResponse> => {
		try {
			const deletedData = await DB.delete(this.model)
				.where(eq(this.model.id, id))
				.returning(getDbSelectkey(selectFields, this.model));

			if (deletedData[0]) {
				return {
					success: true,
					message: 'success',
					payload: deletedData[0] ?? {}
				};
			}

			throw error(400, 'no data found');
		} catch (error: any) {
			console.error('err>>>>>', error);
			throw new MyHTTPException(400, {
				message: 'something went Wrong',
				devMessage: error.message,
				error
			});
		}
	};
}
