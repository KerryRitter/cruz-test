import type { ServiceProvider } from '@cruzjs/core/framework/service-provider';
import { SubredditsModule } from './subreddits.module';

export const SubredditsProvider: ServiceProvider = {
  module: SubredditsModule,
};
