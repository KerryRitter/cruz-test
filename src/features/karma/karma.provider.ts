import type { ServiceProvider } from '@cruzjs/core/framework/service-provider';
import { KarmaModule } from './karma.module';

export const KarmaProvider: ServiceProvider = {
  module: KarmaModule,
};
