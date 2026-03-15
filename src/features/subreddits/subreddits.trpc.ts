import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Inject, Router, Route, TrpcRouter } from '@cruzjs/core';
import { publicProcedure, protectedProcedure } from '@cruzjs/core/trpc/context';
import { SubredditsService } from './subreddits.service';
import { createSubredditSchema } from './subreddits.validation';

@Router()
export class SubredditsTrpc extends TrpcRouter {
  @Inject(SubredditsService) private subredditsService!: SubredditsService;

  @Route() list = publicProcedure.query(async () =>
    this.subredditsService.list());

  @Route() getByName = publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      const subreddit = await this.subredditsService.getByName(input.name);
      if (!subreddit) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Subreddit not found' });
      }
      return subreddit;
    });

  @Route() create = protectedProcedure
    .input(createSubredditSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await this.subredditsService.create(ctx.session.user.id, input);
      } catch (error) {
        if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
          throw new TRPCError({ code: 'CONFLICT', message: 'A subreddit with that name already exists' });
        }
        throw error;
      }
    });

  @Route() join = protectedProcedure
    .input(z.object({ subredditId: z.string() }))
    .mutation(async ({ ctx, input }) =>
      this.subredditsService.join(ctx.session.user.id, input.subredditId));

  @Route() leave = protectedProcedure
    .input(z.object({ subredditId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await this.subredditsService.leave(ctx.session.user.id, input.subredditId);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        throw error;
      }
    });

  @Route() mySubscriptions = protectedProcedure.query(async ({ ctx }) =>
    this.subredditsService.listUserSubscriptions(ctx.session.user.id));
}
