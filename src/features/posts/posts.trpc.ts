import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Inject, Router, Route, TrpcRouter } from '@cruzjs/core';
import { publicProcedure, protectedProcedure } from '@cruzjs/core/trpc/context';
import { PostsService } from './posts.service';
import { createPostSchema } from './posts.validation';

@Router()
export class PostsTrpc extends TrpcRouter {
  @Inject(PostsService) private postsService!: PostsService;

  @Route() listBySubreddit = publicProcedure
    .input(z.object({
      subredditId: z.string(),
      sort: z.enum(['new', 'top']).default('new'),
    }))
    .query(async ({ input }) =>
      this.postsService.listBySubreddit(input.subredditId, input.sort));

  @Route() getById = publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const post = await this.postsService.getById(input.id);
      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }
      return post;
    });

  @Route() create = protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await this.postsService.create(ctx.session.user.id, input);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    });

  @Route() feed = publicProcedure
    .input(z.object({ sort: z.enum(['new', 'top']).default('new') }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id ?? null;
      return this.postsService.getFeed(userId, input.sort);
    });

  @Route() listByAuthor = publicProcedure
    .input(z.object({ authorId: z.string() }))
    .query(async ({ input }) =>
      this.postsService.listByAuthor(input.authorId));
}
