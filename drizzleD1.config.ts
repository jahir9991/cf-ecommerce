import type { Config } from 'drizzle-kit';

export default {
	schema: 'src/db/schemas/index.ts',
	out: 'migrationsD1',
	driver: 'libsql',
	breakpoints: true
} satisfies Config;
