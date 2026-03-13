import { z } from 'zod';

export const createSubredditSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(21, 'Name must be at most 21 characters')
    .regex(/^[a-z0-9_]+$/, 'Name can only contain lowercase letters, numbers, and underscores')
    .trim(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
});

export type CreateSubredditInput = z.infer<typeof createSubredditSchema>;
