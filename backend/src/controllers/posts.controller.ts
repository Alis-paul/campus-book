import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { AppError } from '../utils/errors';

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    res.status(200).json({ status: 'success', data: { posts } });
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;
    const imageUrl = req.file?.path;

    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        userId: req.user!.id,
      },
    });

    res.status(201).json({ status: 'success', data: { post } });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.post.findUnique({ where: { id: req.params.id as string } });

    if (!post) return next(new AppError('Post not found', 404));
    if (post.userId !== req.user!.id) return next(new AppError('Unauthorized', 403));

    await prisma.post.delete({ where: { id: req.params.id as string } });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: req.params.id as string,
          userId: req.user!.id,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      return res.status(200).json({ status: 'success', message: 'Post unliked' });
    }

    await prisma.like.create({
      data: { postId: req.params.id as string, userId: req.user!.id },
    });

    res.status(200).json({ status: 'success', message: 'Post liked' });
  } catch (error) {
    next(error);
  }
};

export const commentOnPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        postId: req.params.id as string,
        userId: req.user!.id,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    res.status(201).json({ status: 'success', data: { comment } });
  } catch (error) {
    next(error);
  }
};
