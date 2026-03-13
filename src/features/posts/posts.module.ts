import { Module } from '@cruzjs/core/di';
import { PostsService } from './posts.service';
import { postsTrpc } from './posts.trpc';
import { postsRoutes } from './posts.routes';

@Module({
  providers: [PostsService],
  routers: {
    posts: postsTrpc,
  },
  routes: postsRoutes,
})
export class PostsModule {}
