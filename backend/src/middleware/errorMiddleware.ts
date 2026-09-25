import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error('[API Error Handler]', err);

  let statusCode = (err as any).statusCode || (err as any).status || 500;
  let errorCode = (err as any).code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred. Please try again.';

  // Catch body parser syntax errors or invalid JSON tokens
  if (
    err instanceof SyntaxError &&
    ('body' in err || (err as any).status === 400 || message.includes('is not valid JSON') || message.includes('Unexpected token'))
  ) {
    if (req.path?.includes('/auth/login') || req.originalUrl?.includes('/auth/login')) {
      statusCode = 401;
      errorCode = 'INVALID_CREDENTIALS';
      message = 'Invalid email or password';
    } else {
      statusCode = 400;
      errorCode = 'INVALID_JSON';
      message = 'Invalid request payload';
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message
    }
  });
}
