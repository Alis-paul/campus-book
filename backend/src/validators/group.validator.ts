import { z } from 'zod';

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    college: z.string().optional(),
  }),
});
