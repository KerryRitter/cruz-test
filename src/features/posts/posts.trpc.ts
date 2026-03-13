import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getAppContainer } from '@cruzjs/core';
import { router, publicProcedure, protectedProcedure } from '@cruzjs/core/trpc/context';
import { PostsService } from './posts.service';
import { createPostSchema } from './posts.validation';

export const postsTrpc = router({
  listBySubreddit: publicProcedure
    .input(z.object({
      subredditId: z.string(),
      sort: z.enum(['new', 'top']).default('new'),
    }))
    .query(async ({ input }) => {
      const container = await getAppContainer();
      const service = container.resolve(PostsService);
      return service.listBySubreddit(input.subredditId, input.sort);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const container = await getAppContainer();
      const service = container.resolve(PostsService);
      const post = await service.getById(input.id);
      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }
      return post;
    }),

  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(PostsService);
      try {
        return await service.create(ctx.session.user.id, input);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    }),

  feed: publicProcedure
    .input(z.object({ sort: z.enum(['new', 'top']).default('new') }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id ?? null;
      const container = await getAppContainer();
      const service = container.resolve(PostsService);
      return service.getFeed(userId, input.sort);
    }),
});
