import type { Request, Response, NextFunction } from 'express';
import { AppError } from './appError.js';

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = err instanceof AppError
    ? err
    : new AppError('Internal Server Error', 500);

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors !== undefined ? { errors: error.errors } : {}),
  });
};