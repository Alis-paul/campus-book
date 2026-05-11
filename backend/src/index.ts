import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler } from './middleware/error';
import { initSockets } from './sockets';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import postRoutes from './routes/posts.routes';
import aiRoutes from './routes/ai.routes';
import groupRoutes from './routes/groups.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import notificationRoutes from './routes/notifications.routes';
import analyticsRoutes from './routes/analytics.routes';
import bookingRoutes from './routes/booking.routes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/bookings', bookingRoutes);

// Socket.io initialization
initSockets(io);

import prisma from './prisma/client';

// Global Error Handler
app.use(errorHandler);

// Auto-expiry Background Job
setInterval(async () => {
  try {
    const now = new Date();
    
    // 1. Expire past bookings
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        endTime: { lt: now }
      },
      select: { id: true }
    });

    if (expiredBookings.length > 0) {
      await prisma.booking.updateMany({
        where: { id: { in: expiredBookings.map(b => b.id) } },
        data: { status: 'EXPIRED' }
      });
      console.log(`Auto-expired ${expiredBookings.length} bookings.`);
    }

    // 2. Mark no-shows as GHOST (15 mins after startTime if still CONFIRMED)
    const fifteenMinsAgo = new Date(now.getTime() - 15 * 60000);
    const noShows = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        startTime: { lt: fifteenMinsAgo }
      },
      select: { id: true }
    });

    if (noShows.length > 0) {
      await prisma.booking.updateMany({
        where: { id: { in: noShows.map(b => b.id) } },
        data: { status: 'GHOST' }
      });
      console.log(`Marked ${noShows.length} no-shows as GHOST.`);
    }
  } catch (error) {
    console.error('Auto-expiry job error:', error);
  }
}, 60000);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
