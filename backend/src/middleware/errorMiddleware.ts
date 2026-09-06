import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error('[API Error Handler]', err);

  const statusCode = (err as any).statusCode || 500;
  const errorCode = (err as any).code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred. Please try again.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message
    }
  });
}
