import { Module } from '@cruzjs/core/di';
import { SubredditsService } from './subreddits.service';
import { subredditsTrpc } from './subreddits.trpc';
import { subredditsRoutes } from './subreddits.routes';

@Module({
  providers: [SubredditsService],
  routers: {
    subreddits: subredditsTrpc,
  },
  routes: subredditsRoutes,
})
export class SubredditsModule {}
