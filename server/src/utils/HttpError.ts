/**
 * Error with an HTTP status code attached.
 * Controllers map it via `error.status` (the global error handler in
 * ExpressAppConfig.ts already reads `err.status || err.statusCode || 500`).
 */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export function statusOf(error: unknown, fallback = 400): number {
  if (error instanceof HttpError) return error.status;
  const status = (error as any)?.status;
  return typeof status === "number" ? status : fallback;
}
