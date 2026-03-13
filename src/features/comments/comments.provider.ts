import type { ServiceProvider } from '@cruzjs/core/framework/service-provider';
import { CommentsModule } from './comments.module';

export const CommentsProvider: ServiceProvider = {
  module: CommentsModule,
};
