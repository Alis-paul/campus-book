import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import prisma from '../prisma/client';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    let decoded: { id: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { id: string };
    } catch {
      return next(new AppError('Not authorized, token is invalid or expired', 401));
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = user as any;
    next();
  } catch (error) {
    return next(new AppError('Authentication failed', 401));
  }
};

/**
 * Restrict access to specific roles (case-insensitive comparison).
 * Usage: restrictTo('faculty', 'admin')
 */
export const restrictTo = (...roles: string[]) => {
  const normalizedRoles = roles.map(r => r.toLowerCase());
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = ((req as any).user?.role || '').toLowerCase();
    if (!normalizedRoles.includes(userRole)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
