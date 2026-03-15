import { Module } from '@cruzjs/core/di';
import { KarmaService } from './karma.service';
import { KarmaTrpc } from './karma.trpc';
import { karmaRoutes } from './karma.routes';

@Module({
  providers: [KarmaService, KarmaTrpc],
  trpcRouters: {
    karma: KarmaTrpc,
  },
  pageRoutes: karmaRoutes,
})
export class KarmaModule {}
