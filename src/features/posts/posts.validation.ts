import { z } from 'zod';

export const createPostSchema = z.object({
  subredditId: z.string().min(1, 'Subreddit is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(300, 'Title must be at most 300 characters')
    .trim(),
  body: z
    .string()
    .max(40000, 'Body must be at most 40000 characters')
    .optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
