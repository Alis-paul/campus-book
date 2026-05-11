import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AppError } from '../utils/errors';
import QRCode from 'qrcode';

export const getResources = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const resources = await prisma.resource.findMany({
      include: {
        bookings: {
          where: {
            endTime: { gt: now },
            status: { in: ['CONFIRMED', 'ACTIVE', 'GHOST'] }
          },
          include: { user: { select: { name: true } } },
        },
      },
    });
    res.status(200).json({ status: 'success', data: { resources } });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resourceId, startTime, endTime } = req.body;
    const userId = req.user!.id;
    const start = new Date(startTime);
    const end = new Date(endTime);

    const conflict = await prisma.booking.findFirst({
      where: {
        resourceId,
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } }
        ]
      }
    });

    if (conflict) {
      return res.status(409).json({
        status: 'fail',
        message: 'This room is already booked for the selected time slot'
      });
    }

    const booking = await prisma.booking.create({
      data: {
        resourceId,
        userId,
        startTime: start,
        endTime: end,
        status: 'CONFIRMED',
      },
      include: { resource: true },
    });

    const qrCodeBase64 = await QRCode.toDataURL(booking.qrCodeToken);
    res.status(201).json({ status: 'success', data: { booking, qrCodeBase64 } });
  } catch (error) {
    next(error);
  }
};

export const checkIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, studentId } = req.body;
    const userRole = req.user!.role;
    const now = new Date();

    if (userRole !== 'student') {
      return res.status(403).json({ status: 'fail', message: 'Only students can confirm faculty presence' });
    }

    const booking = await prisma.booking.findUnique({
      where: { qrCodeToken: token as string },
      include: { resource: true, user: true }
    });

    if (!booking) {
      return res.status(400).json({ status: 'fail', message: 'Invalid QR code' });
    }

    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({ status: 'fail', message: 'QR code already used or expired' });
    }

    const startTime = new Date(booking.startTime);
    const fifteenMinsAfter = new Date(startTime.getTime() + 15 * 60000);

    if (now < startTime) {
      return res.status(400).json({ status: 'fail', message: 'Too early for check-in' });
    }

    if (now > fifteenMinsAfter) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'GHOST' }
      });
      return res.status(400).json({ status: 'fail', message: 'Check-in window expired' });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'ACTIVE',
        checkedInById: (studentId || req.user!.id) as string,
        checkedAt: now
      } as any
    });

    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'CHECK_IN',
        message: `A student has confirmed your presence in ${booking.resource.name}. Your booking is now Active.`,
      }
    });

    res.status(200).json({
      status: 'success',
      message: `You have confirmed Dr. ${booking.user.name} is present in ${booking.resource.name}`
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { startTime: 'asc' },
    });

    const bookingsWithQR = await Promise.all(bookings.map(async b => {
      if (b.status === 'CONFIRMED') {
        const qrCodeBase64 = await QRCode.toDataURL(b.qrCodeToken as string);
        return { ...b, qrCodeBase64 };
      }
      return b;
    }));

    res.status(200).json({ status: 'success', data: { bookings: bookingsWithQR } });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking || booking.userId !== userId) {
      return next(new AppError('Booking not found or unauthorized', 404));
    }

    await prisma.booking.delete({ where: { id } });
    res.status(200).json({ status: 'success', message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserWaitlists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const waitlists = await prisma.waitlist.findMany({
      where: { userId },
      include: { resource: true },
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json({ status: 'success', data: { waitlists } });
  } catch (error) {
    next(error);
  }
};

export const joinWaitlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resourceId } = req.body;
    const userId = req.user!.id;

    const existing = await prisma.waitlist.findFirst({
      where: { resourceId, userId }
    });

    if (existing) {
      return res.status(409).json({ status: 'fail', message: 'Already on waitlist for this resource' });
    }

    const waitlist = await prisma.waitlist.create({ data: { resourceId, userId, requestedTime: new Date() }, include: { resource: true } });

    res.status(201).json({ status: 'success', data: { waitlist } });
  } catch (error) {
    next(error);
  }
};

export const leaveWaitlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const waitlist = await prisma.waitlist.findUnique({ where: { id } });

    if (!waitlist || waitlist.userId !== userId) {
      return next(new AppError('Waitlist entry not found or unauthorized', 404));
    }

    await prisma.waitlist.delete({ where: { id } });
    res.status(200).json({ status: 'success', message: 'Left waitlist successfully' });
  } catch (error) {
    next(error);
  }
};