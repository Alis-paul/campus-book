import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AppError } from '../utils/errors';

export const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, college } = req.body;

    const group = await prisma.group.create({
      data: {
        name,
        description,
        college,
        ownerId: req.user!.id,
        members: {
          create: [{ userId: req.user!.id, role: 'ADMIN' }],
        },
      },
    });

    res.status(201).json({ status: 'success', data: { group } });
  } catch (error) {
    next(error);
  }
};

export const getGroups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, college } = req.query;

    const filters: any = {};
    if (q) filters.name = { contains: String(q), mode: 'insensitive' };
    if (college) filters.college = { equals: String(college), mode: 'insensitive' };

    const groups = await prisma.group.findMany({
      where: filters,
      include: {
        _count: { select: { members: true } },
      },
    });

    res.status(200).json({ status: 'success', data: { groups } });
  } catch (error) {
    next(error);
  }
};

export const joinGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groupId = req.params.id as string;
    const userId = req.user!.id;

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) return next(new AppError('Group not found', 404));

    const existingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existingMember) return next(new AppError('Already a member', 400));

    const member = await prisma.groupMember.create({
      data: { groupId, userId, role: 'MEMBER' },
    });

    res.status(200).json({ status: 'success', data: { member } });
  } catch (error) {
    next(error);
  }
};

export const getGroupMembers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const members = await prisma.groupMember.findMany({
      where: { groupId: req.params.id as string },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    res.status(200).json({ status: 'success', data: { members } });
  } catch (error) {
    next(error);
  }
};
