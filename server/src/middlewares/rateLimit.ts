import type { Request, Response, NextFunction } from 'express';
import { TooManyRequestsError } from '../errors/errors.js';

interface WindowEntry {
  count: number;
  resetAt: number;
}

const createRateLimit = (windowMs: number, max: number, message: string) => {
  const entries = new Map<string, WindowEntry>();

  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const now = Date.now();
    const current = entries.get(key);

    if (!current || current.resetAt <= now) {
      entries.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      return next(new TooManyRequestsError(message));
    }
    next();
  };
};

export const loginRateLimit = createRateLimit(
  15 * 60 * 1000,
  10,
  'Too many login attempts. Please try again later',
);

export const passwordResetRateLimit = createRateLimit(
  60 * 60 * 1000,
  5,
  'Too many password reset attempts. Please try again later',
);