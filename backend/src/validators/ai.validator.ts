import { z } from 'zod';

export const summarizeSchema = z.object({
  body: z.object({
    text: z.string().min(10, 'Text must be at least 10 characters long'),
    style: z.enum(['bullet', 'paragraph']),
  }),
});

export const quizSchema = z.object({
  body: z.object({
    material: z.string().min(20, 'Material must be at least 20 characters long'),
  }),
});

export const essaySchema = z.object({
  body: z.object({
    essay: z.string().min(50, 'Essay must be at least 50 characters long'),
  }),
});

export const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required'),
  }),
});
