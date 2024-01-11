import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const ProductD1 = sqliteTable('products', {
	id: text('id').primaryKey(),
	name: text('name').unique(),
	price: integer('price').default(0),
	description: text('description').default(null),

	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	createdBy: text('created_by'),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
	updatedBy: text('updated_by'),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by')
});
