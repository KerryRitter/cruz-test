import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { Inject, Router, Route, TrpcRouter } from '@cruzjs/core';
import { protectedProcedure } from '@cruzjs/core/trpc/context';
import { ModerationService } from './moderation.service';

@Router()
export class ModerationTrpc extends TrpcRouter {
  @Inject(ModerationService) private moderationService!: ModerationService;

  @Route() banUser = protectedProcedure
    .input(z.object({
      subredditId: z.string(),
      userId: z.string(),
      reason: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await this.moderationService.banUser(ctx.session.user.id, input.subredditId, input.userId, input.reason);
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
    });

  @Route() unbanUser = protectedProcedure
    .input(z.object({
      subredditId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await this.moderationService.unbanUser(ctx.session.user.id, input.subredditId, input.userId);
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    });

  @Route() removePost = protectedProcedure
    .input(z.object({
      subredditId: z.string(),
      postId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await this.moderationService.removePost(ctx.session.user.id, input.subredditId, input.postId);
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    });

  @Route() restorePost = protectedProcedure
    .input(z.object({
      subredditId: z.string(),
      postId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await this.moderationService.restorePost(ctx.session.user.id, input.subredditId, input.postId);
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    });

  @Route() promoteModerator = protectedProcedure
    .input(z.object({
      subredditId: z.string(),
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await this.moderationService.promoteModerator(ctx.session.user.id, input.subredditId, input.userId);
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
        throw error;
      }
    });

  @Route() listBans = protectedProcedure
    .input(z.object({ subredditId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await this.moderationService.listBans(ctx.session.user.id, input.subredditId);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    });

  @Route() listMembers = protectedProcedure
    .input(z.object({ subredditId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await this.moderationService.listMembers(ctx.session.user.id, input.subredditId);
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({ code: 'FORBIDDEN', message: error.message });
        }
        throw error;
      }
    });
}
