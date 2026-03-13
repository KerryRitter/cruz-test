import { Module } from '@cruzjs/core/di';
import { CommentsService } from './comments.service';
import { commentsTrpc } from './comments.trpc';

@Module({
  providers: [CommentsService],
  routers: {
    comments: commentsTrpc,
  },
})
export class CommentsModule {}
