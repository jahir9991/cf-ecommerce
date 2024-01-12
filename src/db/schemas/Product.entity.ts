import { sql, type InferSelectModel } from 'drizzle-orm';
import { integer, sqliteTable, sqliteView, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema } from 'drizzle-zod';
import { nanoid } from 'nanoid';
import { z } from 'zod';
export const Product = sqliteTable('products', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid(12)),
	name: text('name').notNull(),
	price: integer('price').default(0.0).notNull(),
	description: text('description').notNull(),
	image: text('image'),
	imageUrl: text('image_url'),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
	createdBy: text('created_by'),
	updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
	updatedBy: text('updated_by'),
	deletedAt: text('deleted_at'),
	deletedBy: text('deleted_by')
});

export type ProductSelect = InferSelectModel<typeof Product>;

export const ProductView = sqliteView('product_view').as((qb) => qb.select().from(Product));

export const insertProductDto = createInsertSchema(Product);
