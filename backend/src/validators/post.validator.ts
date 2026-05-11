import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Post content is required'),
  }),
});

export const commentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment cannot be empty'),
  }),
});
