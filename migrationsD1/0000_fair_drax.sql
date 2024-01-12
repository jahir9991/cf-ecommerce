CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`description` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`created_by` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
