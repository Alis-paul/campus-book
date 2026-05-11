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

    // DEMO MODE HANDLING
    if (token === 'demo-faculty' || token === 'demo-student') {
      const role = token === 'demo-faculty' ? 'faculty' : 'student';
      let user = await (prisma.user as any).findFirst({ where: { role } });
      
      // If no user exists for this role, create a demo one on the fly to prevent crashes
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
            email: `demo-${role}@example.com`,
            password: 'demo-password-not-used',
            role: role,
            college: 'CampusBook Demo University'
          }
        });
      }
      
      req.user = user as any;
      return next();
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
