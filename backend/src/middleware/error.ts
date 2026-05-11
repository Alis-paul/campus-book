import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Always log for server-side debugging
  console.error(`[${new Date().toISOString()}] Error:`, err.message || err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      status: 'fail',
      message: `Validation error: ${messages}`,
    });
  }

  // Handle Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'fail',
      message: 'A record with this value already exists',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      status: 'fail',
      message: 'Record not found',
    });
  }

  // Fallback - don't expose internal details in production
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (err.message || 'Internal server error'),
  });
};
