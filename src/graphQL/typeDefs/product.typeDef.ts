export const productTypeDefination = /* GraphQL */ `
	type Query {
		products(q: String, limit: Int, page: Int): ProductsResponse!
		product(id: ID!): ProductResponse!
	}
	type Mutation {
		postProduct(
			name: String!
			price: Float!
			description: String!
			image: Upload!
		): ProductResponse!

		updateProduct(id: ID!): ProductResponse!
		deleteProduct(id: ID!): ProductResponse!
	}

	type Product {
		id: ID!
		name: String!
		price: Float
		description: String
		image: String
		imageUrl: String
		isActive: Boolean
		createdAt: String
		createdBy: String
		updatedAt: String
		updatedBy: String
		deletedAt: String
		deletedBy: String
	}

	type ProductResponse {
		success: Boolean
		message: String
		payload: Product
	}
	type ProductsResponse {
		success: Boolean
		message: String
		meta: Meta
		payload: [Product]
	}
`;
