import { Module } from '@cruzjs/core/di';
import { ModerationService } from './moderation.service';
import { ModerationTrpc } from './moderation.trpc';
import { moderationRoutes } from './moderation.routes';

@Module({
  providers: [ModerationService, ModerationTrpc],
  routers: {
    moderation: ModerationTrpc,
  },
  routes: moderationRoutes,
})
export class ModerationModule {}
