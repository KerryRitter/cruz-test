import { Module } from '@cruzjs/core/di';
import { SubredditsService } from './subreddits.service';
import { subredditsTrpc } from './subreddits.trpc';

@Module({
  providers: [SubredditsService],
  routers: {
    subreddits: subredditsTrpc,
  },
})
export class SubredditsModule {}
