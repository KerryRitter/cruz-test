import { Module } from '@cruzjs/core/di';
import { PostsService } from './posts.service';
import { postsTrpc } from './posts.trpc';

@Module({
  providers: [PostsService],
  routers: {
    posts: postsTrpc,
  },
})
export class PostsModule {}
