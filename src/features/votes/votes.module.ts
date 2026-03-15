import { Module } from '@cruzjs/core/di';
import { VotesService } from './votes.service';
import { VotesTrpc } from './votes.trpc';

@Module({
  providers: [VotesService, VotesTrpc],
  trpcRouters: {
    votes: VotesTrpc,
  },
})
export class VotesModule {}
