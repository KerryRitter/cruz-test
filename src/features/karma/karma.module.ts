import { Module } from '@cruzjs/core/di';
import { KarmaService } from './karma.service';
import { karmaTrpc } from './karma.trpc';

@Module({
  providers: [KarmaService],
  routers: {
    karma: karmaTrpc,
  },
})
export class KarmaModule {}
