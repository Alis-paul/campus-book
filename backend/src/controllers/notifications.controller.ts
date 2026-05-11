import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.status(200).json({ status: 'success', data: { notifications } });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notificationId = req.params.id as string;

    const notification = await prisma.notification.updateMany({
      where: { id: notificationId, userId: req.user!.id },
      data: { read: true },
    });

    res.status(200).json({ status: 'success', message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};
