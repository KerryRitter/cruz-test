import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Inject, Router, Route, TrpcRouter } from '@cruzjs/core';
import { publicProcedure, protectedProcedure } from '@cruzjs/core/trpc/context';
import { CommentsService } from './comments.service';

@Router()
export class CommentsTrpc extends TrpcRouter {
  @Inject(CommentsService) private commentsService!: CommentsService;

  @Route() listByPost = publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) =>
      this.commentsService.listByPost(input.postId));

  @Route() create = protectedProcedure
    .input(z.object({
      postId: z.string(),
      body: z.string().min(1).max(10000).trim(),
      parentCommentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await this.commentsService.create(ctx.session.user.id, input);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        throw error;
      }
    });

  @Route() voteComment = protectedProcedure
    .input(z.object({
      commentId: z.string(),
      value: z.union([z.literal(1), z.literal(-1)]),
    }))
    .mutation(async ({ ctx, input }) => {
      await this.commentsService.voteComment(ctx.session.user.id, input.commentId, input.value);
      return { success: true };
    });

  @Route() getUserVotesForComments = protectedProcedure
    .input(z.object({
      commentIds: z.array(z.string()),
    }))
    .query(async ({ ctx, input }) =>
      this.commentsService.getUserVotesForComments(ctx.session.user.id, input.commentIds));
}
