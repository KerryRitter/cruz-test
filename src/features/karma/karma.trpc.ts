import { z } from 'zod';
import { getAppContainer } from '@cruzjs/core';
import { router, publicProcedure, protectedProcedure } from '@cruzjs/core/trpc/context';
import { KarmaService } from './karma.service';

export const karmaTrpc = router({
  getMyKarma: protectedProcedure.query(async ({ ctx }) => {
    const container = await getAppContainer();
    const service = container.resolve(KarmaService);
    return service.getKarma(ctx.session.user.id);
  }),

  getUserKarma: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const container = await getAppContainer();
      const service = container.resolve(KarmaService);
      return service.getKarma(input.userId);
    }),
});
