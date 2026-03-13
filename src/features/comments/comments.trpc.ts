import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getAppContainer } from '@cruzjs/core';
import { router, publicProcedure, protectedProcedure } from '@cruzjs/core/trpc/context';
import { CommentsService } from './comments.service';

export const commentsTrpc = router({
  listByPost: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) => {
      const container = await getAppContainer();
      const service = container.resolve(CommentsService);
      return service.listByPost(input.postId);
    }),

  create: protectedProcedure
    .input(z.object({
      postId: z.string(),
      body: z.string().min(1).max(10000).trim(),
      parentCommentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(CommentsService);
      try {
        return await service.create(ctx.session.user.id, input);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        throw error;
      }
    }),

  voteComment: protectedProcedure
    .input(z.object({
      commentId: z.string(),
      value: z.union([z.literal(1), z.literal(-1)]),
    }))
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(CommentsService);
      await service.voteComment(ctx.session.user.id, input.commentId, input.value);
      return { success: true };
    }),

  getUserVotesForComments: protectedProcedure
    .input(z.object({
      commentIds: z.array(z.string()),
    }))
    .query(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(CommentsService);
      return service.getUserVotesForComments(ctx.session.user.id, input.commentIds);
    }),
});
