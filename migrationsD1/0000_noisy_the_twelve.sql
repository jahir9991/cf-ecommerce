CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`price` integer DEFAULT 0,
	`description` text DEFAULT null,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`created_by` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_name_unique` ON `products` (`name`);