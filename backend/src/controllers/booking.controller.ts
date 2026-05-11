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
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: [{ location: 'asc' }, { name: 'asc' }],
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

    if (!resourceId || !startTime || !endTime) {
      return next(new AppError('resourceId, startTime, and endTime are required', 400));
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new AppError('Invalid startTime or endTime format', 400));
    }

    if (end <= start) {
      return next(new AppError('End time must be after start time', 400));
    }

    if (start < new Date()) {
      return next(new AppError('Cannot book a time slot in the past', 400));
    }

    // Check resource exists
    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Check for conflicts
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
    const { token } = req.body;
    const now = new Date();

    if (!token) {
      return res.status(400).json({ status: 'fail', message: 'QR token is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { qrCodeToken: token as string },
      include: { resource: true, user: true }
    });

    if (!booking) {
      return res.status(400).json({ status: 'fail', message: 'Invalid QR code' });
    }

    if (booking.status === 'ACTIVE') {
      return res.status(400).json({ status: 'fail', message: 'Already checked in' });
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
      return res.status(400).json({ status: 'fail', message: 'Check-in window expired (15 minutes)' });
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'ACTIVE',
        checkedInById: req.user!.id,
        checkedAt: now
      } as any
    });

    await prisma.notification.create({
      data: {
        userId: booking.userId,
        type: 'CHECK_IN',
        message: `Check-in confirmed for ${booking.resource.name}. Booking is now Active.`,
      }
    });

    res.status(200).json({
      status: 'success',
      message: `Check-in successful for ${booking.resource.name}`
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
      orderBy: { startTime: 'desc' },
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

    if (!booking) {
      return next(new AppError('Booking not found', 404));
    }

    if (booking.userId !== userId) {
      return next(new AppError('Not authorized to cancel this booking', 403));
    }

    if (['ACTIVE', 'EXPIRED', 'GHOST'].includes(booking.status)) {
      return next(new AppError('Cannot cancel a booking that is already active or completed', 400));
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

    if (!resourceId) {
      return next(new AppError('resourceId is required', 400));
    }

    const existing = await prisma.waitlist.findFirst({
      where: { resourceId, userId, status: 'WAITING' }
    });

    if (existing) {
      return res.status(409).json({ status: 'fail', message: 'Already on waitlist for this resource' });
    }

    const waitlist = await prisma.waitlist.create({
      data: { resourceId, userId, requestedTime: new Date() },
      include: { resource: true }
    });

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

    if (!waitlist) {
      return next(new AppError('Waitlist entry not found', 404));
    }

    if (waitlist.userId !== userId) {
      return next(new AppError('Not authorized to remove this waitlist entry', 403));
    }

    await prisma.waitlist.delete({ where: { id } });
    res.status(200).json({ status: 'success', message: 'Left waitlist successfully' });
  } catch (error) {
    next(error);
  }
};