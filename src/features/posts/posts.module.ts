import { Module } from '@cruzjs/core/di';
import { PostsService } from './posts.service';
import { PostsTrpc } from './posts.trpc';
import { postsRoutes } from './posts.routes';

@Module({
  providers: [PostsService, PostsTrpc],
  routers: {
    posts: PostsTrpc,
  },
  routes: postsRoutes,
})
export class PostsModule {}
