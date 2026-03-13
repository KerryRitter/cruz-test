import { Module } from '@cruzjs/core/di';
import { ModerationService } from './moderation.service';
import { moderationTrpc } from './moderation.trpc';

@Module({
  providers: [ModerationService],
  routers: {
    moderation: moderationTrpc,
  },
})
export class ModerationModule {}
