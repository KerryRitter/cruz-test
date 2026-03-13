import { z } from 'zod';
import { getAppContainer } from '@cruzjs/core';
import { router, protectedProcedure } from '@cruzjs/core/trpc/context';
import { VotesService } from './votes.service';

export const votesTrpc = router({
  castVote: protectedProcedure
    .input(z.object({
      postId: z.string(),
      value: z.union([z.literal(1), z.literal(-1)]),
    }))
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(VotesService);
      await service.vote(ctx.session.user.id, input.postId, input.value);
      return { success: true };
    }),

  getUserVotesForPosts: protectedProcedure
    .input(z.object({
      postIds: z.array(z.string()),
    }))
    .query(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(VotesService);
      return service.getUserVotesForPosts(ctx.session.user.id, input.postIds);
    }),
});
