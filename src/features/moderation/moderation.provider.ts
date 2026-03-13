import type { ServiceProvider } from '@cruzjs/core/framework/service-provider';
import { ModerationModule } from './moderation.module';

export const ModerationProvider: ServiceProvider = {
  module: ModerationModule,
};
