import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AppError } from '../utils/errors';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: { id: true, name: true, email: true, college: true, course: true, year: true, avatar: true, bio: true, createdAt: true },
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
    let avatarUrl = req.file?.path;

    const data: any = { name, college, course, bio };
    if (year) data.year = parseInt(year);
    if (avatarUrl) data.avatar = avatarUrl;

    if (req.user!.id !== (req.params.id as string)) {
      return next(new AppError('Unauthorized', 403));
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id as string },
      data,
      select: { id: true, name: true, email: true, college: true, course: true, year: true, avatar: true, bio: true },
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
      select: { id: true, name: true, email: true, createdAt: true },
    });
    res.status(200).json({ status: 'success', data: { users } });
  } catch (error) {
    next(error);
  }
};
