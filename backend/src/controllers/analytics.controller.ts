import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const [totalBookings, totalResources, occupiedCount, waitlistCount] = await Promise.all([
      prisma.booking.count(),
      prisma.resource.count(),
      prisma.resource.count({
        where: {
          bookings: {
            some: {
              startTime: { lte: now },
              endTime: { gte: now },
              status: 'CONFIRMED'
            }
          }
        }
      }),
      prisma.waitlist.count({
        where: { status: 'WAITING' }
      })
    ]);

    const occupancyRate = totalResources > 0 ? Math.round((occupiedCount / totalResources) * 100) : 0;

    // Resource Allocation by Type
    const resources = await prisma.resource.findMany({
      select: { type: true }
    });
    
    const allocationMap: Record<string, number> = {};
    resources.forEach(r => {
      allocationMap[r.type] = (allocationMap[r.type] || 0) + 1;
    });
    
    const resourceAllocation = Object.entries(allocationMap).map(([name, value]) => ({ name, value }));

    // Building Status (Occupancy by Location)
    const locations = ["A Block", "B Block", "C Block", "D Block", "G Block", "M Block"];
    const buildingStatus = await Promise.all(locations.map(async (loc) => {
      const totalInLoc = await prisma.resource.count({ where: { location: loc } });
      const occupiedInLoc = await prisma.resource.count({
        where: {
          location: loc,
          bookings: {
            some: {
              startTime: { lte: now },
              endTime: { gte: now },
              status: 'CONFIRMED'
            }
          }
        }
      });
      const val = totalInLoc > 0 ? Math.round((occupiedInLoc / totalInLoc) * 100) : 0;
      return {
        name: loc,
        val,
        status: val > 80 ? 'danger' : val > 50 ? 'warning' : 'success'
      };
    }));

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          bookings: totalBookings,
          activeSessions: occupiedCount,
          waitlisted: waitlistCount
        },
        resourceAllocation,
        buildingStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBookings = await prisma.booking.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    const activityByDay = recentBookings.reduce((acc: Record<string, number>, booking: { createdAt: Date }) => {
      const date = booking.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Ensure we have entries for the last 7 days even if 0
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      chartData.push({
        date: dateStr,
        bookings: activityByDay[dateStr] || 0
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        chartData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAiUsageStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const aiSessions = await prisma.aISession.findMany({
      where: { userId },
      select: { featureType: true, tokens: true, createdAt: true },
    });

    const usageByType = aiSessions.reduce((acc: Record<string, number>, session: { featureType: string; tokens: number }) => {
      acc[session.featureType] = (acc[session.featureType] || 0) + session.tokens;
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: {
        totalTokens: Object.values(usageByType).reduce((a: any, b: any) => a + b, 0),
        usageByType,
      },
    });
  } catch (error) {
    next(error);
  }
};
