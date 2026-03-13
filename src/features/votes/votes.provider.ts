import type { ServiceProvider } from '@cruzjs/core/framework/service-provider';
import { VotesModule } from './votes.module';

export const VotesProvider: ServiceProvider = {
  module: VotesModule,
};
