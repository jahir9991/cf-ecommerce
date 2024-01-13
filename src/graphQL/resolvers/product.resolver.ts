import { getGraphQlField } from '@/app/utils/getGraphQlFeild.util';
import { UpdateProductDto, insertProductDto } from '@/dto/product.dto';
import { ProductService } from '@/services/product.service';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { GraphQLError, type GraphQLResolveInfo } from 'graphql';

// const modelService = DI.container.resolve(PostService);
const modelService = new ProductService();

const getAll = async (_, arg, context, info: GraphQLResolveInfo) => {
	try {
		const selectFields = getGraphQlField(info.fieldNodes[0].selectionSet);
		const DB = context.locals.DB;

		const result = await modelService.getAll(
			DB,
			{
				q: arg.q,
				limit: arg.limit ?? 10,
				page: arg.page ?? 1
			},
			selectFields.payload?.keys ?? [],
			selectFields.meta ?? false
		);

		return result;
	} catch (error) {
		throw new GraphQLError(error);
	}
};

const getOne = async (c, arg, context, info) => {
	try {
		const selectFields = getGraphQlField(info.fieldNodes[0].selectionSet);
		const DB = context.locals.DB;

		const result = await modelService.getOne(DB, arg.id, selectFields.payload?.keys ?? []);

		return result;
	} catch (error) {
		console.log(error);

		throw new GraphQLError(`User with id  not found.`);
	}
};

const createOne = async (c, arg, { locals }, info) => {
	try {
		console.log('calling......');

		const selectFields = getGraphQlField(info.fieldNodes[0].selectionSet);
		const DB: DrizzleD1Database = locals.DB;
		const R2: R2Bucket = locals.R2;

		let productData;
		try {
			productData = insertProductDto.parse(arg);
		} catch (err) {
			console.log('h>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', err);

			throw {
				message: 'invalid payload...',
				validations: err
			};
		}

		const result = await modelService.createOne(
			DB,
			R2,
			productData,
			selectFields.payload?.keys ?? []
		);

		return result;
	} catch (error) {
		// console.log(error);

		throw new GraphQLError(error.message);
	}
};

const updateOne = async (c, arg, { locals }, info) => {
	try {
		console.log('calling......');

		const selectFields = getGraphQlField(info.fieldNodes[0].selectionSet);
		const DB: DrizzleD1Database = locals.DB;
		const R2: R2Bucket = locals.R2;

		let productData;
		try {
			productData = UpdateProductDto.parse(arg);
		} catch (err) {
			console.log('h>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', err);

			throw {
				message: 'invalid payload...',
				validations: err
			};
		}

		const result = await modelService.updateOne(
			DB,
			R2,
			arg.id,
			productData,
			selectFields.payload?.keys ?? []
		);

		return result;
	} catch (error) {
		throw new GraphQLError(error.message);
	}
};

const deleteOne = async (c, arg, { locals }, info) => {
	try {
		const selectFields = getGraphQlField(info.fieldNodes[0].selectionSet);
		const DB: DrizzleD1Database = locals.DB;
		const R2: R2Bucket = locals.R2;

		const result = await modelService.deleteOne(DB, R2, arg.id, selectFields.payload?.keys ?? []);

		return result;
	} catch (error) {
		throw new GraphQLError(error.message);
	}
};

export const productResolver = {
	Query: {
		products: getAll,
		product: getOne
	},
	Mutation: {
		postProduct: createOne,
		updateProduct: updateOne,
		deleteProduct: deleteOne
	}
};
