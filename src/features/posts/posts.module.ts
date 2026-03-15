import { Module } from '@cruzjs/core/di';
import { PostsService } from './posts.service';
import { PostsTrpc } from './posts.trpc';
import { postsRoutes } from './posts.routes';

@Module({
  providers: [PostsService, PostsTrpc],
  trpcRouters: {
    posts: PostsTrpc,
  },
  pageRoutes: postsRoutes,
})
export class PostsModule {}
