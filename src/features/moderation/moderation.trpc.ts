import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getAppContainer } from '@cruzjs/core';
import { router, protectedProcedure } from '@cruzjs/core/trpc/context';
import { ModerationService } from './moderation.service';

export const moderationTrpc = router({
  banUser: protectedProcedure
    .input(z.object({
      subredditId: z.string(),
      userId: z.string(),
      reason: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(ModerationService);
      try {
        await service.banUser(ctx.session.user.id, input.subredditId, input.userId, input.reason);
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('moderator')) {
            throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
          }
          if (error.message.includes('UNIQUE constraint')) {
            throw new TRPCError({ code: 'CONFLICT', message: 'User is already banned' });
          }
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        throw error;
      }
    }),

  unbanUser: protectedProcedure
    .input(z.object({
      subredditId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(ModerationService);
      try {
        await service.unbanUser(ctx.session.user.id, input.subredditId, input.userId);
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    }),

  removePost: protectedProcedure
    .input(z.object({
      subredditId: z.string(),
      postId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(ModerationService);
      try {
        await service.removePost(ctx.session.user.id, input.subredditId, input.postId);
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    }),

  restorePost: protectedProcedure
    .input(z.object({
      subredditId: z.string(),
      postId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(ModerationService);
      try {
        await service.restorePost(ctx.session.user.id, input.subredditId, input.postId);
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    }),

  promoteModerator: protectedProcedure
    .input(z.object({
      subredditId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(ModerationService);
      try {
        await service.promoteModerator(ctx.session.user.id, input.subredditId, input.userId);
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        throw error;
      }
    }),

  listBans: protectedProcedure
    .input(z.object({ subredditId: z.string() }))
    .query(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(ModerationService);
      try {
        return await service.listBans(ctx.session.user.id, input.subredditId);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    }),

  listMembers: protectedProcedure
    .input(z.object({ subredditId: z.string() }))
    .query(async ({ ctx, input }) => {
      const container = await getAppContainer();
      const service = container.resolve(ModerationService);
      try {
        return await service.listMembers(ctx.session.user.id, input.subredditId);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    }),
});
