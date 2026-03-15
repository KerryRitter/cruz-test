import { Module } from '@cruzjs/core/di';
import { ModerationService } from './moderation.service';
import { ModerationTrpc } from './moderation.trpc';
import { moderationRoutes } from './moderation.routes';

@Module({
  providers: [ModerationService, ModerationTrpc],
  trpcRouters: {
    moderation: ModerationTrpc,
  },
  pageRoutes: moderationRoutes,
})
export class ModerationModule {}
