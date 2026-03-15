import { z } from 'zod';
import { Inject, Router, Route, TrpcRouter } from '@cruzjs/core';
import { publicProcedure, protectedProcedure } from '@cruzjs/core/trpc/context';
import { KarmaService } from './karma.service';

@Router()
export class KarmaTrpc extends TrpcRouter {
  @Inject(KarmaService) private karmaService!: KarmaService;

  @Route() getMyKarma = protectedProcedure.query(async ({ ctx }) =>
    this.karmaService.getKarma(ctx.session.user.id));

  @Route() getUserKarma = publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) =>
      this.karmaService.getKarma(input.userId));
}
