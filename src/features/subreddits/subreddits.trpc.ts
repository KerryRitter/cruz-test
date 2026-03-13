import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getAppContainer } from '@cruzjs/core';
import { router, publicProcedure, protectedProcedure } from '@cruzjs/core/trpc/context';
import { SubredditsService } from './subreddits.service';
import { createSubredditSchema } from './subreddits.validation';

export const subredditsTrpc = router({
  list: publicProcedure.query(async () => {
    const container = await getAppContainer();
    const service = container.resolve(SubredditsService);
    return service.list();
  }),

  getByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const container = await getAppContainer();
      const service = container.resolve(SubredditsService);
      const subreddit = await service.getByName(input.name);
      if (!subreddit) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subreddit not found' });
      }
      return subreddit;
    }),

  create: protectedProcedure
    .input(createSubredditSchema)
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(SubredditsService);
      try {
        return await service.create(ctx.session.user.id, input);
      } catch (error) {
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
          throw new TRPCError({ code: 'CONFLICT', message: 'A subreddit with that name already exists' });
        }
        throw error;
      }
    }),

  join: protectedProcedure
    .input(z.object({ subredditId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(SubredditsService);
      return service.join(ctx.session.user.id, input.subredditId);
    }),

  leave: protectedProcedure
    .input(z.object({ subredditId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(SubredditsService);
      try {
        return await service.leave(ctx.session.user.id, input.subredditId);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        throw error;
      }
    }),

  mySubscriptions: protectedProcedure.query(async ({ ctx }) => {
    const container = await getAppContainer();
    const service = container.resolve(SubredditsService);
    return service.listUserSubscriptions(ctx.session.user.id);
  }),
});
