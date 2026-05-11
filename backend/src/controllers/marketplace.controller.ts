import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AppError } from '../utils/errors';

export const createListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, price, category, college } = req.body;
    const imageUrl = req.file?.path;

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        college,
        imageUrl,
        userId: req.user!.id,
      },
    });

    res.status(201).json({ status: 'success', data: { listing } });
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, college, minPrice, maxPrice } = req.query;

    const filters: any = {};
    if (category) filters.category = String(category);
    if (college) filters.college = String(college);
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(String(minPrice));
      if (maxPrice) filters.price.lte = parseFloat(String(maxPrice));
    }

    const listings = await prisma.listing.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    res.status(200).json({ status: 'success', data: { listings } });
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, price, status } = req.body;
    const listingId = req.params.id as string;

    const existingListing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!existingListing) return next(new AppError('Listing not found', 404));
    if (existingListing.userId !== req.user!.id) return next(new AppError('Unauthorized', 403));

    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : undefined,
        status,
      },
    });

    res.status(200).json({ status: 'success', data: { listing } });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = req.params.id as string;

    const existingListing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!existingListing) return next(new AppError('Listing not found', 404));
    if (existingListing.userId !== req.user!.id) return next(new AppError('Unauthorized', 403));

    await prisma.listing.delete({ where: { id: listingId } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
