import { createYoga } from 'graphql-yoga';

import { makeExecutableSchema } from '@graphql-tools/schema';

import { globalTypeDefination } from './typeDefs/global.typeDef';
import { productTypeDefination } from './typeDefs/product.typeDef';
import { productResolver } from './resolvers/product.resolver';
export const GraphQLServer = (context) => {
	return createYoga({
		schema: makeExecutableSchema({
			resolvers: [productResolver],
			typeDefs: [globalTypeDefination, productTypeDefination]
		}),
		context,
		graphqlEndpoint: '/graphql',
		landingPage: true,
		multipart: true,
		cors: true,
		logging: 'error'
	}).handle(context.request, context.response);
};
