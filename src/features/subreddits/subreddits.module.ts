import { Module } from '@cruzjs/core/di';
import { SubredditsService } from './subreddits.service';
import { SubredditsTrpc } from './subreddits.trpc';
import { subredditsRoutes } from './subreddits.routes';

@Module({
  providers: [SubredditsService, SubredditsTrpc],
  routers: {
    subreddits: SubredditsTrpc,
  },
  routes: subredditsRoutes,
})
export class SubredditsModule {}
