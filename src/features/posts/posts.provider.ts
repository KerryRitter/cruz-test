import type { ServiceProvider } from '@cruzjs/core/framework/service-provider';
import { PostsModule } from './posts.module';

export const PostsProvider: ServiceProvider = {
  module: PostsModule,
};
