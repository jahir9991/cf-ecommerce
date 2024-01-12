import { HttpStatus } from './httpStatus.enum';

export class MyHTTPException extends Error {
	readonly status: HttpStatus;
	readonly message: string;
	readonly devMessage: string;
	readonly error: unknown;
	constructor(status: HttpStatus, options: { message: string; devMessage?: string; error?: unknown }) {
		super(options?.message);
		this.status = status;
		this.message = options.message;
		this.devMessage = options.devMessage ?? options.message;
		this.error = options.error;
	}
}
