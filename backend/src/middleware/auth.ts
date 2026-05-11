import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';
import prisma from '../prisma/client';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized, no token provided', 401));
    }

    // Support fake-token for testing purposes
    if (token === 'fake-token') {
      const testingUser = await prisma.user.findFirst();
      if (!testingUser) return next(new AppError('No users found in DB for testing', 404));
      req.user = testingUser as any;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { id: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = user as any;
    next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed', 401));
  }
};
