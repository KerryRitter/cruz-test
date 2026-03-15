import { z } from 'zod';
import { Inject, Router, Route, TrpcRouter } from '@cruzjs/core';
import { protectedProcedure } from '@cruzjs/core/trpc/context';
import { VotesService } from './votes.service';

@Router()
export class VotesTrpc extends TrpcRouter {
  @Inject(VotesService) private votesService!: VotesService;

  @Route() castVote = protectedProcedure
    .input(z.object({
      postId: z.string(),
      value: z.union([z.literal(1), z.literal(-1)]),
    }))
    .mutation(async ({ ctx, input }) => {
      await this.votesService.vote(ctx.session.user.id, input.postId, input.value);
      return { success: true };
    });

  @Route() getUserVotesForPosts = protectedProcedure
    .input(z.object({
      postIds: z.array(z.string()),
    }))
    .query(async ({ ctx, input }) =>
      this.votesService.getUserVotesForPosts(ctx.session.user.id, input.postIds));
}
