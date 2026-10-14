import type { Request, Response, NextFunction } from 'express';
import { AppError } from './appError.js';

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  void _next;

  if (!(err instanceof AppError)) {
    const errorDetails = err instanceof Error
      ? {
          name: err.name,
          message: err.message,
          stack: err.stack,
          ...('code' in err && { code: err.code }),
          ...('meta' in err && { meta: err.meta }),
          ...('clientVersion' in err && { clientVersion: err.clientVersion }),
        }
      : String(err);

    console.error('Unhandled request error', {
      method: req.method,
      path: req.originalUrl,
      error: errorDetails,
    });
  }

  const error = err instanceof AppError
    ? err
    : new AppError('Internal Server Error', 500);

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors !== undefined ? { errors: error.errors } : {}),
  });
};