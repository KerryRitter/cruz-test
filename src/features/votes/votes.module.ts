import { Module } from '@cruzjs/core/di';
import { VotesService } from './votes.service';
import { votesTrpc } from './votes.trpc';

@Module({
  providers: [VotesService],
  routers: {
    votes: votesTrpc,
  },
})
export class VotesModule {}
