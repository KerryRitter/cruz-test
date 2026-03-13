import { router } from '@cruzjs/core/trpc/context';
import { registerCruzCoreTrpcRouters } from '@cruzjs/core/trpc/routers';
import { registerCruzStartTrpcRouters } from '@cruzjs/start/trpc/routers';
import { notesTrpc } from '@/features/notes/notes.trpc';

const appRouter = router({
  ...registerCruzCoreTrpcRouters(),
  ...registerCruzStartTrpcRouters(),
  notes: notesTrpc,
});

export type AppRouter = typeof appRouter;
