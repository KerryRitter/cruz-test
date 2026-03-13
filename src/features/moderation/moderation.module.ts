import { Module } from '@cruzjs/core/di';
import { ModerationService } from './moderation.service';
import { moderationTrpc } from './moderation.trpc';
import { moderationRoutes } from './moderation.routes';

@Module({
  providers: [ModerationService],
  routers: {
    moderation: moderationTrpc,
  },
  routes: moderationRoutes,
})
export class ModerationModule {}
