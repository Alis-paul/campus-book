import { z } from 'zod';

export const createListingSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    price: z.number().min(0),
    category: z.string(),
    college: z.string().optional(),
  }),
});
