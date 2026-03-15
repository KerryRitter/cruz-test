import { Module } from '@cruzjs/core/di';
import { CommentsService } from './comments.service';
import { CommentsTrpc } from './comments.trpc';

@Module({
  providers: [CommentsService, CommentsTrpc],
  routers: {
    comments: CommentsTrpc,
  },
})
export class CommentsModule {}
