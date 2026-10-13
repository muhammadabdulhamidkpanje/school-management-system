import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../errors/index.js';

// Verify JWT
export const authenticate = (
  req: Request, _res: Response, next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return next(new UnauthorizedError('No token provided'));

  try {
    req.user = verifyAccessToken(header.split(' ')[1]);
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

// Check role
export const authorizeRole = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return next(new ForbiddenError('Insufficient role'));
    next();
  };

// Check permission
export const authorizePermission = (...perms: string[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthorizedError());
    const has = perms.every(p => req.user!.permissions.includes(p));
    if (!has) return next(new ForbiddenError('Insufficient permissions'));
    next();
  };