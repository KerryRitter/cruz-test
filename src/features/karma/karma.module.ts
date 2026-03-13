import { Module } from '@cruzjs/core/di';
import { KarmaService } from './karma.service';
import { karmaTrpc } from './karma.trpc';
import { karmaRoutes } from './karma.routes';

@Module({
  providers: [KarmaService],
  routers: {
    karma: karmaTrpc,
  },
  routes: karmaRoutes,
})
export class KarmaModule {}
