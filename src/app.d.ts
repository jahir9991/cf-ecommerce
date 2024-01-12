// See https://kit.svelte.dev/docs/types#app

import type { HttpStatus } from './app/exceptions/httpStatus.enum';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			status?: HttpStatus;
			success?: boolean;
			message: string;
			devMessage?: string;
			validations?: any;
			error?: any;
		}
		interface Locals {
			DB: DrizzleD1Database;
			R2: R2Bucket;
		}
		// interface PageData {}
		interface Platform {
			env?: {
				DB: D1Database;
				R2: R2Bucket;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};
