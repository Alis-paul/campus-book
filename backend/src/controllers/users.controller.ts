import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AppError } from '../utils/errors';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: { id: true, name: true, email: true, college: true, course: true, year: true, role: true, avatar: true, bio: true, createdAt: true },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, college, course, year, bio } = req.body;
    const avatarUrl = req.file?.path;

    if (req.user!.id !== (req.params.id as string)) {
      return next(new AppError('You can only update your own profile', 403));
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (college !== undefined) data.college = college;
    if (course !== undefined) data.course = course;
    if (bio !== undefined) data.bio = bio;
    if (year !== undefined) data.year = parseInt(String(year), 10);
    if (avatarUrl) data.avatar = avatarUrl;

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id as string },
      data,
      select: { id: true, name: true, email: true, college: true, course: true, year: true, role: true, avatar: true, bio: true },
    });

    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
};

/**
 * Allow a user to update their OWN role.
 * In production, you may want to restrict this to admin-only.
 * Currently allows self-role-change so faculty users registered as 'student' can fix themselves.
 */
export const updateMyRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const userId = req.user!.id;

    const normalizedRole = (role || '').toLowerCase();
    if (!['faculty', 'student'].includes(normalizedRole)) {
      return next(new AppError("Role must be 'faculty' or 'student'", 400));
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: normalizedRole },
      select: { id: true, name: true, email: true, role: true, college: true, course: true, year: true, avatar: true, bio: true },
    });

    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
};

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, college, course } = req.query;

    const filters: any = {};
    if (q) filters.name = { contains: String(q), mode: 'insensitive' };
    if (college) filters.college = { equals: String(college), mode: 'insensitive' };
    if (course) filters.course = { equals: String(course), mode: 'insensitive' };

    const users = await prisma.user.findMany({
      where: filters,
      select: { id: true, name: true, college: true, course: true, avatar: true },
    });

    res.status(200).json({ status: 'success', data: { users } });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ status: 'success', data: { users } });
  } catch (error) {
    next(error);
  }
};
