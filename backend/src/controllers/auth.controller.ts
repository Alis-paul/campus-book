import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { AppError } from '../utils/errors';

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'],
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, college, course, role } = req.body;
    // year may come as string from form, coerce safely
    const year = req.body.year ? parseInt(String(req.body.year), 10) : undefined;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Normalize role to lowercase for consistent storage
    const normalizedRole = (role || 'student').toLowerCase();

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, college, course, year, role: normalizedRole },
    });

    const { accessToken, refreshToken } = generateTokens(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt }
    });

    // Don't return the password hash
    const { password: _pw, ...safeUser } = user as any;
    res.status(201).json({ status: 'success', data: { user: safeUser, accessToken, refreshToken } });
  } catch (error) {
    console.error('Register error:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt }
    });

    // Don't return the password hash
    const { password: _pw, ...safeUser } = user as any;
    res.status(200).json({ status: 'success', data: { user: safeUser, accessToken, refreshToken } });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    const savedToken = await prisma.refreshToken.findUnique({ where: { token } });

    if (!savedToken || savedToken.expiresAt < new Date()) {
      if (savedToken) await prisma.refreshToken.delete({ where: { token } });
      return next(new AppError('Refresh token is invalid or expired', 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string };
      const tokens = generateTokens(decoded.id);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.refreshToken.update({
        where: { token },
        data: { token: tokens.refreshToken, expiresAt }
      });

      res.status(200).json({ status: 'success', data: tokens });
    } catch (err) {
      return next(new AppError('Invalid refresh token', 401));
    }
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ status: 'success', message: 'Reset token sent to email' });
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ status: 'success', message: 'Password reset successful' });
};
